import { NextRequest, NextResponse } from 'next/server';

import { KonsumenDB } from '@/lib/database/konsumen';
import { KonsumenData } from '@/types/konsumen';

// GET /api/konsumen/[id] - Show specific konsumen (Laravel style)
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);

    if (isNaN(id)) {
      return NextResponse.json({ message: 'Invalid ID format. ID must be a number.' }, { status: 400 });
    }

    const konsumen = KonsumenDB.getById(id);

    if (!konsumen) {
      return NextResponse.json({ message: 'Konsumen not found.' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Konsumen retrieved successfully.',
      data: konsumen
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: 'Internal Server Error',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PUT /api/konsumen/[id] - Update konsumen (Laravel style)
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    const body = await request.json();

    if (isNaN(id)) {
      return NextResponse.json({ message: 'Invalid ID format. ID must be a number.' }, { status: 400 });
    }

    const existingKonsumen = KonsumenDB.getById(id);
    if (!existingKonsumen) {
      return NextResponse.json({ message: 'Konsumen not found.' }, { status: 404 });
    }

    // Validation (Laravel style)
    const requiredFields = ['name', 'phone', 'email', 'address'];
    const missingFields = requiredFields.filter((field) => !body[field]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          message: 'The given data was invalid.',
          errors: missingFields.reduce(
            (acc, field) => {
              acc[field] = [`The ${field} field is required.`];
              return acc;
            },
            {} as Record<string, string[]>
          )
        },
        { status: 422 }
      );
    }

    // Check if email already exists (excluding current konsumen)
    if (KonsumenDB.emailExists(body.email, id)) {
      return NextResponse.json(
        {
          message: 'The given data was invalid.',
          errors: {
            email: ['The email has already been taken.']
          }
        },
        { status: 422 }
      );
    }

    // Update konsumen
    const updatedKonsumen = KonsumenDB.update(id, {
      name: body.name,
      description: body.description || existingKonsumen.description,
      phone: body.phone,
      email: body.email,
      address: body.address
    });

    return NextResponse.json({
      message: 'Konsumen updated successfully.',
      data: updatedKonsumen
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: 'Internal Server Error',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PATCH /api/konsumen/[id] - Partial update konsumen (Laravel style)
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    const body = await request.json();

    if (isNaN(id)) {
      return NextResponse.json({ message: 'Invalid ID format. ID must be a number.' }, { status: 400 });
    }

    const existingKonsumen = KonsumenDB.getById(id);
    if (!existingKonsumen) {
      return NextResponse.json({ message: 'Konsumen not found.' }, { status: 404 });
    }

    // Check if email already exists (excluding current konsumen) if email is being updated
    if (body.email && KonsumenDB.emailExists(body.email, id)) {
      return NextResponse.json(
        {
          message: 'The given data was invalid.',
          errors: {
            email: ['The email has already been taken.']
          }
        },
        { status: 422 }
      );
    }

    // Prepare update data (only include provided fields)
    const updateData: Partial<Omit<KonsumenData, 'id' | 'no'>> = {};
    if (body.name) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.phone) updateData.phone = body.phone;
    if (body.email) updateData.email = body.email;
    if (body.address) updateData.address = body.address;
    if (body.ktp_number) updateData.ktp_number = body.ktp_number;

    // Partial update konsumen
    const updatedKonsumen = KonsumenDB.update(id, updateData);

    return NextResponse.json({
      message: 'Konsumen updated successfully.',
      data: updatedKonsumen
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: 'Internal Server Error',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE /api/konsumen/[id] - Delete konsumen (Laravel style)
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);

    if (isNaN(id)) {
      return NextResponse.json({ message: 'Invalid ID format. ID must be a number.' }, { status: 400 });
    }

    const deletedKonsumen = KonsumenDB.delete(id);

    if (!deletedKonsumen) {
      return NextResponse.json({ message: 'Konsumen not found.' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Konsumen deleted successfully.',
      data: deletedKonsumen
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: 'Internal Server Error',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
