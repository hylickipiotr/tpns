-- CreateTable
CREATE TABLE `tpns_olx_offer` (
    `id` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `last_refresh_time` DATETIME(3) NOT NULL,
    `created_time` DATETIME(3) NOT NULL,
    `valid_to_time` DATETIME(3) NOT NULL,
    `pushup_time` DATETIME(3) NULL,
    `location_region_name` VARCHAR(191) NOT NULL,
    `location_city_name` VARCHAR(191) NOT NULL,
    `param_price` INTEGER NOT NULL,
    `param_enginesize` INTEGER NOT NULL,
    `param_year` INTEGER NOT NULL,
    `param_millage` INTEGER NOT NULL,
    `param_country_origin` VARCHAR(191) NULL,
    `create_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
