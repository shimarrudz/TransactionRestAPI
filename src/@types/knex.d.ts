// Esta extensão de arquivo, diz que haverá apenas typescript 
import { Knex } from 'knex'

declare module 'knex/type/tables' {
    export interface Tables{
        transactions: {
            id: string
            title: string
            amount: number
            created_at: string
            session_id?: string
        }
    }
}