import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    const hashedPassword = await bcrypt.hash("123456", 10);
    
    // Test kullanıcısını oluştur
    const testUser = await prisma.user.create({
      data: {
        email: "test@example.com",
        password: hashedPassword,
        fullName: "Test Kullanıcı",
        phone: "+90 555 123 4567",
        lastLoginAt: new Date(),
        tokens: 100,
        language: "tr",
        theme: "light",
      },
    });

    console.log("Test kullanıcısı oluşturuldu:", testUser);
  } catch (error) {
    console.error("Hata:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser(); 