#!/bin/bash

# Install PDF generation dependencies
echo "Installing PDF generation dependencies..."
npm install pdfkit @types/pdfkit

echo ""
echo "✅ Dependencies installed successfully!"
echo ""
echo "📝 Next steps:"
echo "1. Make sure NEXT_PUBLIC_API_URL is set in your .env.local file"
echo "2. Run 'npm run dev' to start the development server"
echo "3. Login to the application"
echo "4. Test PDF generation on a transaction with status Approved/ITJ/Akad"
echo ""
echo "📖 See PDF_GENERATION_SETUP.md for detailed documentation"

