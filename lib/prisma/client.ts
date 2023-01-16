import { PrismaClient } from "@prisma/client";

class PrismaDb {
  private static privateDb: PrismaClient;

  static get db() {
    if (this.privateDb === null || !this.privateDb)
      this.privateDb = new PrismaClient();
    return this.privateDb;
  }
}

export default PrismaDb;
