import { NextRequest, NextResponse } from 'next/server';

import { PesanDB } from '@/lib/database/pesan';

// GET /api/pesan/[id] - Show specific message
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        {
          message: 'Invalid ID format',
          error: 'ID must be a number'
        },
        { status: 400 }
      );
    }

    const pesan = PesanDB.getById(id);

    if (!pesan) {
      return NextResponse.json(
        {
          message: 'Message not found',
          error: `Message with ID ${id} does not exist`
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Message retrieved successfully',
      data: pesan
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

// PUT /api/pesan/[id] - Update specific message
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();

    if (isNaN(id)) {
      return NextResponse.json(
        {
          message: 'Invalid ID format',
          error: 'ID must be a number'
        },
        { status: 400 }
      );
    }

    // Check if message exists
    const existingMessage = PesanDB.getById(id);
    if (!existingMessage) {
      return NextResponse.json(
        {
          message: 'Message not found',
          error: `Message with ID ${id} does not exist`
        },
        { status: 404 }
      );
    }

    // Validate allowed fields for update
    const allowedFields = ['message', 'is_read'];
    const updateData: { message?: string; is_read?: boolean } = {};

    // Only update allowed fields
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field as keyof typeof updateData] = body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        {
          message: 'The given data was invalid.',
          errors: {
            update: ['No valid fields provided for update.']
          }
        },
        { status: 422 }
      );
    }

    // Update the message
    const updatedMessage = PesanDB.update(id, updateData);

    if (!updatedMessage) {
      return NextResponse.json(
        {
          message: 'Failed to update message',
          error: 'Update operation failed'
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Message updated successfully',
      data: updatedMessage
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

// DELETE /api/pesan/[id] - Delete specific message
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        {
          message: 'Invalid ID format',
          error: 'ID must be a number'
        },
        { status: 400 }
      );
    }

    // Check if message exists
    const existingMessage = PesanDB.getById(id);
    if (!existingMessage) {
      return NextResponse.json(
        {
          message: 'Message not found',
          error: `Message with ID ${id} does not exist`
        },
        { status: 404 }
      );
    }

    // Delete the message
    const deletedMessage = PesanDB.delete(id);

    if (!deletedMessage) {
      return NextResponse.json(
        {
          message: 'Failed to delete message',
          error: 'Delete operation failed'
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Message deleted successfully',
      data: deletedMessage
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
