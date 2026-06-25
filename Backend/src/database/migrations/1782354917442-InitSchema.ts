import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchema1782354917442 implements MigrationInterface {
    name = 'InitSchema1782354917442'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "template_builder"."template_items" ("uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "rollingId" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "name" character varying(255) NOT NULL, "summary" text NOT NULL DEFAULT '', "status" character varying(32) NOT NULL DEFAULT 'draft', "priority" character varying(32) NOT NULL DEFAULT 'medium', CONSTRAINT "PK_b33653fd19f83e16bff3aef7d6f" PRIMARY KEY ("uuid"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_94929c6a37a1b93c9771bac19a" ON "template_builder"."template_items" ("rollingId") `);
        await queryRunner.query(`CREATE TABLE "template_builder"."users" ("uuid" uuid NOT NULL DEFAULT gen_random_uuid(), "rollingId" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "username" character varying(255) NOT NULL, "passwordHash" character varying(255) NOT NULL, CONSTRAINT "PK_951b8f1dfc94ac1d0301a14b7e1" PRIMARY KEY ("uuid"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_135a9393fcca6e0cfd5d96d24b" ON "template_builder"."users" ("rollingId") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_fe0bb3f6520ee0469504521e71" ON "template_builder"."users" ("username") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "template_builder"."IDX_fe0bb3f6520ee0469504521e71"`);
        await queryRunner.query(`DROP INDEX "template_builder"."IDX_135a9393fcca6e0cfd5d96d24b"`);
        await queryRunner.query(`DROP TABLE "template_builder"."users"`);
        await queryRunner.query(`DROP INDEX "template_builder"."IDX_94929c6a37a1b93c9771bac19a"`);
        await queryRunner.query(`DROP TABLE "template_builder"."template_items"`);
    }

}
