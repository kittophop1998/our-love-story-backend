import {
  Generated,
  Selectable,
} from 'kysely'

export interface Database {
  letters: LetterTable
  letter_attachments: LetterAttachmentTable
  uploaded_files: UploadedFilesTable
}

export interface LetterTable {
  id: Generated<number>
  title: string
  message: string
  public_id: string
  edit_token_hash: string
  sender_name?: string
  cover_image_url?: string
  view_count: Generated<number>
  created_at: Generated<Date>
  updated_at: Date
}

export interface UploadedFilesTable {
  id: Generated<number>
  file_url: string
  created_at: Generated<Date>
  updated_at: Date
}

export interface LetterAttachmentTable {
  id: Generated<number>
  letter_id: number
  file_url: string
  text: string
  type: 'image' | 'video'
  order: number
  created_at: Generated<Date>
  updated_at: Date
}


export type Letter = Selectable<LetterTable>
export type LetterAttachment = Selectable<LetterAttachmentTable>
export type UploadedFile = Selectable<UploadedFilesTable>