import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .createTable('letters')
        .addColumn('id', 'serial', (col) => col.primaryKey())
        .addColumn('title', 'text', (col) => col.notNull())
        .addColumn('message', 'text', (col) => col.notNull())
        .addColumn('public_id', 'varchar(255)', (col) => col.notNull().unique())
        .addColumn('edit_token_hash', 'varchar(255)', (col) => col.notNull())
        .addColumn('sender_name', 'varchar(255)')
        .addColumn('cover_image_url', 'text')
        .addColumn('view_count', 'integer', (col) => col.notNull().defaultTo(0))
        .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
        .addColumn('updated_at', 'timestamp', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`).notNull())
        .execute();

    await db.schema
        .createTable('uploaded_files')
        .addColumn('id', 'serial', (col) => col.primaryKey())
        .addColumn('file_url', 'text', (col) => col.notNull())
        .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
        .addColumn('updated_at', 'timestamp', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`).notNull())
        .execute();

    await db.schema
        .createTable('letter_attachments')
        .addColumn('id', 'serial', (col) => col.primaryKey())
        .addColumn('letter_id', sql`bigint unsigned`, (col) => col.notNull().references('letters.id').onDelete('cascade'))
        .addColumn('file_url', 'text', (col) => col.notNull())
        .addColumn('text', 'text', (col) => col.notNull())
        .addColumn('type', 'varchar(50)', (col) => col.notNull())
        .addColumn('order', 'integer', (col) => col.notNull())
        .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
        .addColumn('updated_at', 'timestamp', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`).notNull())
        .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable('letter_attachments').execute();
    await db.schema.dropTable('uploaded_files').execute();
    await db.schema.dropTable('letters').execute();
}