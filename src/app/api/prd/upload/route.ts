import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import * as pdfParse from 'pdf-parse' // ✅ Fixed import
import mammoth from 'mammoth'
import { marked } from 'marked'

// Helper function to extract text from different file types
async function extractTextFromFile(
  buffer: Buffer,
  filename: string
): Promise<string> {
  const extension = filename.toLowerCase().split('.').pop()

  try {
    if (extension === 'pdf') {
      // @ts-ignore - pdf-parse types issue
      const data = await pdfParse(buffer)
      return data.text
    } else if (extension === 'docx') {
      const result = await mammoth.extractRawText({ buffer })
      return result.value
    } else if (extension === 'md' || extension === 'markdown') {
      const text = buffer.toString('utf-8')
      return text
    } else if (extension === 'txt') {
      return buffer.toString('utf-8')
    } else {
      throw new Error('Unsupported file type')
    }
  } catch (error) {
    console.error('Text extraction error:', error)
    throw new Error('Failed to extract text from file')
  }
}

// Helper function to chunk PRD into sections
function chunkPRD(text: string): Array<{ title: string; content: string; order: number }> {
  const sections: Array<{ title: string; content: string; order: number }> = []
  
  // Split by common section headers (##, ###, or numbered sections)
  const lines = text.split('\n')
  let currentSection = { title: 'Introduction', content: '', order: 0 }
  let sectionOrder = 0

  for (const line of lines) {
    // Check for markdown headers (##, ###) or numbered sections
    const headerMatch = line.match(/^#{1,3}\s+(.+)$/) || line.match(/^\d+\.\s+(.+)$/)
    
    if (headerMatch && line.trim().length > 0) {
      // Save previous section if it has content
      if (currentSection.content.trim().length > 50) {
        sections.push({ ...currentSection })
      }
      
      // Start new section
      sectionOrder++
      currentSection = {
        title: headerMatch[1].trim(),
        content: '',
        order: sectionOrder,
      }
    } else {
      currentSection.content += line + '\n'
    }
  }

  // Add the last section
  if (currentSection.content.trim().length > 50) {
    sections.push(currentSection)
  }

  return sections
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const projectName = formData.get('projectName') as string
    const projectDescription = formData.get('projectDescription') as string

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Extract text from file
    const text = await extractTextFromFile(buffer, file.name)

    if (!text || text.trim().length < 100) {
      return NextResponse.json(
        { error: 'File appears to be empty or too short' },
        { status: 400 }
      )
    }

    // Upload file to Supabase Storage
    const fileName = `${user.id}/${Date.now()}-${file.name}`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('prd-files')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('prd-files')
      .getPublicUrl(fileName)

    // Create project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        user_id: user.id,
        name: projectName || file.name.replace(/\.[^/.]+$/, ''),
        description: projectDescription || 'Project created from PRD upload',
        status: 'active',
      })
      .select()
      .single()

    if (projectError) {
      console.error('Project creation error:', projectError)
      return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
    }

    // Chunk the PRD into sections
    const sections = chunkPRD(text)

    // Save PRD sections to database
    const sectionsToInsert = sections.map((section) => ({
      project_id: project.id,
      user_id: user.id,
      file_name: file.name,
      file_url: publicUrl,
      section_title: section.title,
      section_content: section.content.substring(0, 5000), // Limit content length
      section_order: section.order,
      section_type: 'other',
    }))

    const { error: sectionsError } = await supabase
      .from('prd_sections')
      .insert(sectionsToInsert)

    if (sectionsError) {
      console.error('Sections error:', sectionsError)
      return NextResponse.json(
        { error: 'Failed to save PRD sections' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      project,
      sectionsCount: sections.length,
      message: `PRD uploaded successfully! Extracted ${sections.length} sections.`,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    )
  }
}