import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function updateTestUser() {
  try {
    // Test kullanıcısını güncelle
    const updatedUser = await prisma.user.update({
      where: { email: "test@example.com" },
      data: {
        fullName: "Test Kullanıcı",
        phone: "+90 555 123 4567",
        lastLoginAt: new Date(),
        tokens: 100,
        language: "tr",
        theme: "light",
      },
    });

    console.log("Test kullanıcısı güncellendi:", updatedUser);
  } catch (error) {
    console.error("Hata:", error);
  } finally {
    await prisma.$disconnect();
  }
}

updateTestUser(); 