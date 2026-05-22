import { MigrationInterface, QueryRunner } from 'typeorm';

export class Initial1779486960216 implements MigrationInterface {
  name = 'Initial1779486960216';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "patient_table" ("id" SERIAL NOT NULL, "name" character varying(255) NOT NULL, "phone" character varying(20) NOT NULL, "dob" character varying(20) NOT NULL, "email" character varying(255) NOT NULL, "loginid" integer NOT NULL, CONSTRAINT "REL_840ef63dc6ae33b9269ee06b72" UNIQUE ("loginid"), CONSTRAINT "PK_a49e3dad4b02d2616b83831e016" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "login" ("id" SERIAL NOT NULL, "username" character varying(255) NOT NULL, "password" character varying(255) NOT NULL, "usertype" character varying(50) NOT NULL, CONSTRAINT "PK_0e29aa96b7d3fb812ff43fcfcd3" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "health_data" ("id" SERIAL NOT NULL, "IR" double precision NOT NULL, "HeartRate" double precision NOT NULL, "SpO2" double precision NOT NULL, "TempC" double precision NOT NULL, "TempF" double precision NOT NULL, "GSR" double precision NOT NULL, "LSM_AccX" double precision NOT NULL, "LSM_AccY" double precision NOT NULL, "LSM_AccZ" double precision NOT NULL, "HR_Status" character varying(50) NOT NULL, "SpO2_Status" character varying(50) NOT NULL, "Temp_Status" character varying(50) NOT NULL, "Stress_Level" character varying(50) NOT NULL, "Movement_Status" character varying(50) NOT NULL, "timestamp" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ffef5f246975d81edbc2707c39c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "patient_table" ADD CONSTRAINT "FK_840ef63dc6ae33b9269ee06b72b" FOREIGN KEY ("loginid") REFERENCES "login"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "patient_table" DROP CONSTRAINT "FK_840ef63dc6ae33b9269ee06b72b"`,
    );
    await queryRunner.query(`DROP TABLE "health_data"`);
    await queryRunner.query(`DROP TABLE "login"`);
    await queryRunner.query(`DROP TABLE "patient_table"`);
  }
}
