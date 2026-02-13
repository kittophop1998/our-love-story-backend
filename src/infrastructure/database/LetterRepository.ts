import { db } from "./maria";
import { Letter, LetterAttachment } from "./schema";

export interface CreateLetterData {
  title: string;
  message: string;
  public_id: string;
  edit_token_hash: string;
  sender_name?: string;
  cover_image_url?: string;
}

export interface CreateAttachmentData {
  letter_id: number;
  file_url: string;
  text: string;
  type: 'image' | 'video';
  order: number;
}

export class LetterRepository {
  async createUploadedFile(file_url: string): Promise<number> {
    // Validate that file_url is a proper string
    if (typeof file_url !== 'string' || file_url.trim() === '') {
      throw new Error('Invalid file_url: must be a non-empty string');
    }

    console.log('📝 Creating uploaded_files record with file_url:', file_url);

    const result = await db
      .insertInto('uploaded_files')
      .values({ 
        file_url,
        created_at: new Date(),
        updated_at: new Date(),
      })
      .executeTakeFirst()

    if (!result.insertId) {
      throw new Error('Failed to create uploaded file record');
    }

    return Number(result.insertId);
  }

  async createLetter(data: CreateLetterData): Promise<Letter> {
    const result = await db
      .insertInto('letters')
      .values({
        ...data,
        created_at: new Date(),
        updated_at: new Date(),
      })
      .executeTakeFirst();

    if (!result.insertId) {
      throw new Error('Failed to create letter');
    }

    const letter = await this.getLetterById(Number(result.insertId));
    if (!letter) {
      throw new Error('Failed to retrieve created letter');
    }

    return letter;
  }

  async createLetterAttachment(data: CreateAttachmentData): Promise<LetterAttachment> {
    const result = await db
      .insertInto('letter_attachments')
      .values({
        ...data,
        created_at: new Date(),
        updated_at: new Date(),
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return result;
  }

  async createLetterAttachments(attachments: CreateAttachmentData[]): Promise<LetterAttachment[]> {
    if (attachments.length === 0) return [];

    const result = await db
      .insertInto('letter_attachments')
      .values(attachments.map(attachment => ({
        ...attachment,
        created_at: new Date(),
        updated_at: new Date(),
      })))
      .returningAll()
      .execute();

    return result;
  }

  async getLetterById(id: number): Promise<Letter | undefined> {
    return await db
      .selectFrom('letters')
      .where('id', '=', id)
      .selectAll()
      .executeTakeFirst();
  }

  async getLetterByPublicId(publicId: string): Promise<any | undefined> {
    const result = await db
      .selectFrom('letters')
      .leftJoin('letter_attachments', 'letters.id', 'letter_attachments.letter_id')
      .where('public_id', '=', publicId)
      .select([
        'letters.id',
        'letters.title',
        'letters.message',
        'letters.public_id as publicId',
        'letters.edit_token_hash as editTokenHash',
        'letters.sender_name as senderName',
        'letters.cover_image_url as coverImageUrl',
        'letters.view_count as viewCount',
        'letters.created_at as createdAt',
        'letters.updated_at as updatedAt',
        'letter_attachments.id as attachmentId',
        'letter_attachments.file_url as attachmentFileUrl',
        'letter_attachments.text as attachmentText',
        'letter_attachments.type as attachmentType',
        'letter_attachments.order as attachmentOrder',
      ])
      .orderBy('letter_attachments.order', 'asc')
      .execute();

    if (!result || result.length === 0) {
      return undefined;
    }

    // Group attachments
    const letter = result[0];
    const attachments = result
      .filter(row => row.attachmentId !== null)
      .map(row => ({
        id: row.attachmentId,
        fileUrl: row.attachmentFileUrl,
        text: row.attachmentText,
        type: row.attachmentType,
        order: row.attachmentOrder,
      }));

    return {
      id: letter.id,
      title: letter.title,
      message: letter.message,
      publicId: letter.publicId,
      editTokenHash: letter.editTokenHash,
      senderName: letter.senderName,
      coverImageUrl: letter.coverImageUrl,
      viewCount: letter.viewCount,
      createdAt: letter.createdAt,
      updatedAt: letter.updatedAt,
      attachments: attachments,
    };
  }

  async getLetterByEditTokenHash(editTokenHash: string): Promise<any | undefined> {
    return await db
      .selectFrom('letters')
      .innerJoin('letter_attachments', 'letters.id', 'letter_attachments.letter_id')
      .where('edit_token_hash', '=', editTokenHash)
      .select([
        'letters.id',
        'letters.title',
        'letters.message',
        'letters.public_id as publicId',
        'letters.edit_token_hash as editTokenHash',
        'letters.sender_name as senderName',
        'letters.cover_image_url as coverImageUrl',
        'letters.view_count as viewCount',
        'letters.created_at as createdAt',
        'letters.updated_at as updatedAt',
      ])
      .executeTakeFirst();
  }

  async getLetterAttachments(letterId: number): Promise<LetterAttachment[]> {
    return await db
      .selectFrom('letter_attachments')
      .where('letter_id', '=', letterId)
      .orderBy('order', 'asc')
      .selectAll()
      .execute();
  }
}
