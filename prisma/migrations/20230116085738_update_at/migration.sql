/*
  Warnings:

  - You are about to drop the column `create_at` on the `tpns_olx_offer` table. All the data in the column will be lost.
  - Added the required column `updated_at` to the `tpns_olx_offer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `tpns_olx_offer` DROP COLUMN `create_at`,
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL;
