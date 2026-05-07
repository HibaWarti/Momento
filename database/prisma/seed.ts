import "dotenv/config";
import bcrypt from "bcryptjs";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Prisma } from "../generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is missing in database/.env");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function cleanDatabase() {
  await prisma.supportTicketMessage.deleteMany();
  await prisma.supportTicket.deleteMany();

  await prisma.message.deleteMany();
  await prisma.conversationParticipant.deleteMany();
  await prisma.conversation.deleteMany();

  await prisma.notification.deleteMany();
  await prisma.log.deleteMany();

  await prisma.savedService.deleteMany();
  await prisma.savedPost.deleteMany();

  await prisma.commentReaction.deleteMany();
  await prisma.reaction.deleteMany();

  await prisma.report.deleteMany();
  await prisma.review.deleteMany();

  await prisma.serviceImage.deleteMany();
  await prisma.service.deleteMany();

  await prisma.providerProfile.deleteMany();
  await prisma.providerRequest.deleteMany();

  await prisma.comment.deleteMany();
  await prisma.postImage.deleteMany();
  await prisma.post.deleteMany();

  await prisma.follow.deleteMany();
  await prisma.user.deleteMany();
}

async function main() {
  console.log("🌱 Starting Momento seed...");

  await cleanDatabase();

  const password = await bcrypt.hash("Password123!", 10);

  const superAdmin = await prisma.user.create({
    data: {
      firstName: "Hiba",
      lastName: "Admin",
      username: "superadmin",
      email: "superadmin@momento.ma",
      password,
      role: "SUPERADMIN",
      accountStatus: "ACTIVE",
      bio: "Super administratrice de la plateforme Momento.",
    },
  });

  const admin = await prisma.user.create({
    data: {
      firstName: "Sara",
      lastName: "Benali",
      username: "admin.sara",
      email: "admin@momento.ma",
      password,
      role: "ADMIN",
      accountStatus: "ACTIVE",
      bio: "Administratrice chargée de la modération et de la validation des prestataires.",
    },
  });

  const users = await Promise.all([
    prisma.user.create({
      data: {
        firstName: "Yasmine",
        lastName: "Alaoui",
        username: "yasmine",
        email: "yasmine@momento.ma",
        password,
        role: "USER",
        accountStatus: "ACTIVE",
        bio: "Passionnée par les fêtes familiales et les décorations simples.",
      },
    }),
    prisma.user.create({
      data: {
        firstName: "Omar",
        lastName: "El Fassi",
        username: "omar",
        email: "omar@momento.ma",
        password,
        role: "USER",
        accountStatus: "ACTIVE",
        bio: "J’aime découvrir des idées originales pour organiser des événements.",
      },
    }),
    prisma.user.create({
      data: {
        firstName: "Nadia",
        lastName: "Lahlou",
        username: "nadia",
        email: "nadia@momento.ma",
        password,
        role: "USER",
        accountStatus: "ACTIVE",
        bio: "Je cherche souvent de l’inspiration pour les anniversaires et baby showers.",
      },
    }),
  ]);

  const providerUsers = await Promise.all([
    prisma.user.create({
      data: {
        firstName: "Amine",
        lastName: "Traiteur",
        username: "amine.traiteur",
        email: "traiteur@momento.ma",
        password,
        role: "PROVIDER",
        accountStatus: "ACTIVE",
        bio: "Traiteur spécialisé dans les buffets marocains modernes.",
      },
    }),
    prisma.user.create({
      data: {
        firstName: "Leila",
        lastName: "Events",
        username: "leila.events",
        email: "decoratrice@momento.ma",
        password,
        role: "PROVIDER",
        accountStatus: "ACTIVE",
        bio: "Décoration élégante pour mariages, anniversaires et cérémonies privées.",
      },
    }),
    prisma.user.create({
      data: {
        firstName: "Karim",
        lastName: "Photo",
        username: "karim.photo",
        email: "photographe@momento.ma",
        password,
        role: "PROVIDER",
        accountStatus: "ACTIVE",
        bio: "Photographe événementiel à Casablanca et Rabat.",
      },
    }),
  ]);

  const [providerTraiteur, providerDecoratrice, providerPhotographe] = providerUsers;

  await Promise.all([
    prisma.providerRequest.create({
      data: {
        userId: providerTraiteur.id,
        professionalName: "Amine Traiteur",
        professionalDescription: "Service traiteur pour événements familiaux et professionnels.",
        phone: "0611223344",
        city: "Casablanca",
        cinNumber: "BE123456",
        cinPicturePath: "/uploads/cin/amine-cin.png",
        additionalInfo: "Expérience de 5 ans dans les événements privés.",
        status: "APPROVED",
        reviewedById: admin.id,
        reviewedAt: new Date(),
      },
    }),
    prisma.providerRequest.create({
      data: {
        userId: providerDecoratrice.id,
        professionalName: "Leila Events Decoration",
        professionalDescription: "Décoration florale, scénographie et tables personnalisées.",
        phone: "0622334455",
        city: "Rabat",
        cinNumber: "AB654321",
        cinPicturePath: "/uploads/cin/leila-cin.png",
        additionalInfo: "Décoratrice vérifiée avec portfolio complet.",
        status: "APPROVED",
        reviewedById: admin.id,
        reviewedAt: new Date(),
      },
    }),
    prisma.providerRequest.create({
      data: {
        userId: providerPhotographe.id,
        professionalName: "Karim Photo Studio",
        professionalDescription: "Photographie et vidéo pour événements.",
        phone: "0633445566",
        city: "Casablanca",
        cinNumber: "CD789123",
        cinPicturePath: "/uploads/cin/karim-cin.png",
        additionalInfo: "Compte prestataire en attente de vérification complète.",
        status: "PENDING",
      },
    }),
  ]);

  const providerProfiles = await Promise.all([
    prisma.providerProfile.create({
      data: {
        userId: providerTraiteur.id,
        professionalName: "Amine Traiteur",
        professionalDescription: "Buffets marocains, cocktails dînatoires et menus personnalisés.",
        phone: "0611223344",
        city: "Casablanca",
        providerStatus: "ACTIVE",
      },
    }),
    prisma.providerProfile.create({
      data: {
        userId: providerDecoratrice.id,
        professionalName: "Leila Events Decoration",
        professionalDescription: "Décoration complète pour mariages, anniversaires et soirées privées.",
        phone: "0622334455",
        city: "Rabat",
        providerStatus: "ACTIVE",
      },
    }),
    prisma.providerProfile.create({
      data: {
        userId: providerPhotographe.id,
        professionalName: "Karim Photo Studio",
        professionalDescription: "Photos naturelles et vidéos courtes pour événements.",
        phone: "0633445566",
        city: "Casablanca",
        providerStatus: "ACTIVE",
      },
    }),
  ]);

  const [traiteurProfile, decorProfile, photoProfile] = providerProfiles;

  const services = await Promise.all([
    prisma.service.create({
      data: {
        providerProfileId: traiteurProfile.id,
        title: "Buffet marocain premium",
        description: "Buffet complet pour mariages, fiançailles et événements familiaux.",
        price: new Prisma.Decimal(4500),
        city: "Casablanca",
        category: "Traiteur",
        subcategory: "Buffet",
        keywords: ["buffet", "mariage", "traiteur", "marocain"],
        status: "ACTIVE",
        images: {
          create: [
            { imagePath: "/uploads/services/buffet-1.jpg" },
            { imagePath: "/uploads/services/buffet-2.jpg" },
          ],
        },
      },
    }),
    prisma.service.create({
      data: {
        providerProfileId: decorProfile.id,
        title: "Décoration mariage élégante",
        description: "Décoration florale, table d’honneur, arche et coins photo.",
        price: new Prisma.Decimal(7000),
        city: "Rabat",
        category: "Décoration",
        subcategory: "Mariage",
        keywords: ["décoration", "mariage", "fleurs", "arche"],
        status: "ACTIVE",
        images: {
          create: [
            { imagePath: "/uploads/services/deco-1.jpg" },
            { imagePath: "/uploads/services/deco-2.jpg" },
          ],
        },
      },
    }),
    prisma.service.create({
      data: {
        providerProfileId: photoProfile.id,
        title: "Photographie événementielle",
        description: "Couverture photo pour anniversaires, mariages et événements privés.",
        price: new Prisma.Decimal(3000),
        city: "Casablanca",
        category: "Photographie",
        subcategory: "Événementiel",
        keywords: ["photo", "vidéo", "mariage", "anniversaire"],
        status: "ACTIVE",
        images: {
          create: [{ imagePath: "/uploads/services/photo-1.jpg" }],
        },
      },
    }),
  ]);

  const [buffetService, decoService, photoService] = services;

  const posts = await Promise.all([
    prisma.post.create({
      data: {
        authorId: users[0].id,
        content:
          "Petit souvenir de l’anniversaire de ma sœur. La décoration pastel a donné une ambiance très douce.",
        status: "ACTIVE",
        images: {
          create: [
            { imagePath: "/uploads/posts/birthday-1.jpg" },
            { imagePath: "/uploads/posts/birthday-2.jpg" },
          ],
        },
      },
    }),
    prisma.post.create({
      data: {
        authorId: users[1].id,
        content:
          "Inspiration mariage simple : lumière chaude, tables blanches et coin photo minimaliste.",
        status: "ACTIVE",
        images: {
          create: [{ imagePath: "/uploads/posts/wedding-1.jpg" }],
        },
      },
    }),
    prisma.post.create({
      data: {
        authorId: providerDecoratrice.id,
        content:
          "Retour sur une décoration de fiançailles réalisée à Rabat. Thème floral avec touches dorées.",
        status: "ACTIVE",
        images: {
          create: [{ imagePath: "/uploads/posts/deco-event-1.jpg" }],
        },
      },
    }),
  ]);

  const [birthdayPost, weddingPost, decoPost] = posts;

  const comment1 = await prisma.comment.create({
    data: {
      postId: birthdayPost.id,
      userId: users[1].id,
      content: "Très joli thème, les couleurs sont vraiment harmonieuses.",
      status: "VISIBLE",
    },
  });

  await prisma.comment.create({
    data: {
      postId: birthdayPost.id,
      userId: users[0].id,
      parentId: comment1.id,
      content: "Merci beaucoup ! On a choisi des tons pastel.",
      status: "VISIBLE",
    },
  });

  const comment2 = await prisma.comment.create({
    data: {
      postId: weddingPost.id,
      userId: users[2].id,
      content: "J’aime beaucoup le style minimaliste.",
      status: "VISIBLE",
    },
  });

  await Promise.all([
    prisma.reaction.create({
      data: {
        postId: birthdayPost.id,
        userId: users[1].id,
        type: "LIKE",
      },
    }),
    prisma.reaction.create({
      data: {
        postId: weddingPost.id,
        userId: users[0].id,
        type: "LOVE",
      },
    }),
    prisma.reaction.create({
      data: {
        postId: decoPost.id,
        userId: users[2].id,
        type: "WOW",
      },
    }),
    prisma.commentReaction.create({
      data: {
        commentId: comment1.id,
        userId: users[0].id,
        type: "LIKE",
      },
    }),
    prisma.commentReaction.create({
      data: {
        commentId: comment2.id,
        userId: users[1].id,
        type: "LOVE",
      },
    }),
  ]);

  await Promise.all([
    prisma.follow.create({
      data: {
        followerId: users[0].id,
        followingId: providerDecoratrice.id,
      },
    }),
    prisma.follow.create({
      data: {
        followerId: users[1].id,
        followingId: providerTraiteur.id,
      },
    }),
    prisma.follow.create({
      data: {
        followerId: users[2].id,
        followingId: users[0].id,
      },
    }),
  ]);

  await Promise.all([
    prisma.savedPost.create({
      data: {
        userId: users[0].id,
        postId: weddingPost.id,
      },
    }),
    prisma.savedPost.create({
      data: {
        userId: users[1].id,
        postId: birthdayPost.id,
      },
    }),
    prisma.savedService.create({
      data: {
        userId: users[0].id,
        serviceId: decoService.id,
      },
    }),
    prisma.savedService.create({
      data: {
        userId: users[2].id,
        serviceId: buffetService.id,
      },
    }),
  ]);

  await Promise.all([
    prisma.review.create({
      data: {
        userId: users[0].id,
        serviceId: decoService.id,
        rating: 5,
        comment: "Service très professionnel, décoration fidèle aux photos.",
        status: "VISIBLE",
      },
    }),
    prisma.review.create({
      data: {
        userId: users[1].id,
        serviceId: buffetService.id,
        rating: 4,
        comment: "Très bon buffet, livraison à l’heure.",
        status: "VISIBLE",
      },
    }),
    prisma.review.create({
      data: {
        userId: users[2].id,
        serviceId: photoService.id,
        rating: 5,
        comment: "Photos naturelles et très bon contact.",
        status: "VISIBLE",
      },
    }),
  ]);

  const reportPost = await prisma.report.create({
    data: {
      reporterId: users[2].id,
      postId: decoPost.id,
      reason: "Contenu à vérifier",
      description: "Je souhaite signaler cette publication pour vérification.",
      status: "REVIEWING",
      reviewedById: admin.id,
      reviewedAt: new Date(),
      moderationNote: "Signalement en cours de vérification.",
    },
  });

  await prisma.report.create({
    data: {
      reporterId: users[1].id,
      serviceId: photoService.id,
      reason: "Informations incomplètes",
      description: "Le service manque de détails sur la livraison des photos.",
      status: "PENDING",
    },
  });

  await Promise.all([
    prisma.notification.create({
      data: {
        userId: providerTraiteur.id,
        type: "PROVIDER_REQUEST_APPROVED",
        title: "Compte prestataire vérifié",
        message: "Votre identité a été vérifiée par un administrateur.",
        isRead: false,
      },
    }),
    prisma.notification.create({
      data: {
        userId: users[0].id,
        type: "LIKE",
        title: "Nouvelle réaction",
        message: "Quelqu’un a réagi à votre publication.",
        isRead: false,
      },
    }),
    prisma.notification.create({
      data: {
        userId: users[2].id,
        type: "REPORT_STATUS",
        title: "Signalement en cours",
        message: "Votre signalement est en cours de traitement.",
        isRead: true,
      },
    }),
  ]);

  const conversation = await prisma.conversation.create({
    data: {
      participants: {
        create: [{ userId: users[0].id }, { userId: providerDecoratrice.id }],
      },
      messages: {
        create: [
          {
            senderId: users[0].id,
            content: "Bonjour, est-ce que vous êtes disponible pour une décoration d’anniversaire ?",
            isRead: true,
          },
          {
            senderId: providerDecoratrice.id,
            content: "Bonjour, oui bien sûr. Vous pouvez me donner la date et la ville ?",
            isRead: false,
          },
        ],
      },
    },
  });

  const ticket = await prisma.supportTicket.create({
    data: {
      userId: users[2].id,
      assignedToId: admin.id,
      relatedReportId: reportPost.id,
      subject: "Suivi d’un signalement",
      description: "Je souhaite avoir plus d’informations sur le traitement de mon signalement.",
      category: "REPORT",
      status: "IN_PROGRESS",
      priority: "NORMAL",
      messages: {
        create: [
          {
            authorId: users[2].id,
            message: "Bonjour, pouvez-vous me confirmer que mon signalement est en cours ?",
            isStaff: false,
          },
          {
            authorId: admin.id,
            message: "Bonjour, oui, il est en cours de vérification par notre équipe.",
            isStaff: true,
          },
        ],
      },
    },
  });

  await Promise.all([
    prisma.log.create({
      data: {
        actorId: superAdmin.id,
        action: "USER_REGISTER",
        entityType: "User",
        entityId: superAdmin.id,
        description: "Création du compte SuperAdmin de démonstration.",
      },
    }),
    prisma.log.create({
      data: {
        actorId: admin.id,
        action: "PROVIDER_REQUEST_APPROVED",
        entityType: "ProviderRequest",
        entityId: providerTraiteur.id,
        description: "Validation de l'identité du prestataire Amine Traiteur.",
      },
    }),
    prisma.log.create({
      data: {
        actorId: admin.id,
        action: "REPORT_REVIEWED",
        entityType: "Report",
        entityId: reportPost.id,
        description: "Mise en révision d’un signalement.",
      },
    }),
    prisma.log.create({
      data: {
        actorId: admin.id,
        action: "TICKET_UPDATED",
        entityType: "SupportTicket",
        entityId: ticket.id,
        description: "Réponse à un ticket support lié à un signalement.",
      },
    }),
  ]);

  console.log("Seed completed successfully.");
  console.log("");
  console.log("Demo accounts:");
  console.log("SUPERADMIN: superadmin@momento.ma / Password123!");
  console.log("ADMIN:      admin@momento.ma / Password123!");
  console.log("USER:       yasmine@momento.ma / Password123!");
  console.log("PROVIDER:   traiteur@momento.ma / Password123!");
  console.log("");
  console.log(`Conversation created: ${conversation.id}`);
}

main()
  .catch((error) => {
    console.error("Seed failed:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });