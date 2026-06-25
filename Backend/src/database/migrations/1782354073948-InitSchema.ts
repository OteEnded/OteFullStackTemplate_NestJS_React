import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchema1782354073948 implements MigrationInterface {
    name = 'InitSchema1782354073948'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "template_builder"."template_items" ("id" SERIAL NOT NULL, "name" character varying(255) NOT NULL, "summary" text NOT NULL DEFAULT '', "status" character varying(32) NOT NULL DEFAULT 'draft', "priority" character varying(32) NOT NULL DEFAULT 'medium', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_2056c9d8fd53817fd6d49f6eed8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "template_builder"."users" ("id" SERIAL NOT NULL, "username" character varying(255) NOT NULL, "passwordHash" character varying(255) NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_fe0bb3f6520ee0469504521e71" ON "template_builder"."users" ("username") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "template_builder"."IDX_fe0bb3f6520ee0469504521e71"`);
        await queryRunner.query(`DROP TABLE "template_builder"."users"`);
        await queryRunner.query(`DROP TABLE "template_builder"."template_items"`);
    }

}
