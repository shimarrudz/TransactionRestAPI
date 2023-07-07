import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.alterTable('transactions', (table) => {
        table.uuid('id').after('id').index()
    })
}


export async function down(knex: Knex): Promise<void> {
}
