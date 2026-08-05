import { NextRequest, NextResponse } from 'next/server';
import { ContentType, PlatformName, Tone } from '@prisma/client';
import { prisma } from '@/lib/db';
import { formatErrorResponse } from '@/lib/errors';

export async function GET(req: NextRequest) {
  try {
    let pieces = await prisma.contentPiece.findMany({
      take: 20,
      orderBy: { generatedAt: 'desc' },
      include: { idea: true },
    });

    // If database has no content pieces, seed initial records so CUIDs exist
    if (pieces.length === 0) {
      let defaultIdea = await prisma.contentIdea.findFirst();
      if (!defaultIdea) {
        const user = await prisma.user.findFirst();
        if (user) {
          defaultIdea = await prisma.contentIdea.create({
            data: {
              userId: user.id,
              topic: 'Strategi Social Media 2026',
              platforms: [PlatformName.X, PlatformName.THREADS, PlatformName.INSTAGRAM],
            },
          });
        }
      }

      if (defaultIdea) {
        await prisma.contentPiece.createMany({
          data: [
            {
              ideaId: defaultIdea.id,
              platform: PlatformName.X,
              type: ContentType.TEXT,
              tone: Tone.CASUAL,
              text: 'Promo produk baru dengan diskon 20%',
              mediaUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&q=80',
            },
            {
              ideaId: defaultIdea.id,
              platform: PlatformName.THREADS,
              type: ContentType.TEXT,
              tone: Tone.CASUAL,
              text: 'Tips meningkatkan engagement di Threads',
              mediaUrl: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=400&q=80',
            },
            {
              ideaId: defaultIdea.id,
              platform: PlatformName.INSTAGRAM,
              type: ContentType.IMAGE,
              tone: Tone.CASUAL,
              text: 'Review pelanggan bulan ini',
              mediaUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80',
            },
          ],
        });

        pieces = await prisma.contentPiece.findMany({
          take: 20,
          orderBy: { generatedAt: 'desc' },
          include: { idea: true },
        });
      }
    }

    const result = pieces.map((piece) => ({
      id: piece.id, // Genuine Prisma CUID string!
      text: piece.text || 'Untitled Content',
      platform: piece.platform,
      image: piece.mediaUrl || piece.assetUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&q=80',
      isFromDb: true,
    }));

    return NextResponse.json({ content: result });
  } catch (error) {
    return formatErrorResponse(error);
  }
}
