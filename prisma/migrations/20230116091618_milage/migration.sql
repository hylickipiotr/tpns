/*
  Warnings:

  - You are about to drop the column `param_millage` on the `tpns_olx_offer` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `tpns_olx_offer` DROP COLUMN `param_millage`,
    ADD COLUMN `param_milage` INTEGER NULL;
