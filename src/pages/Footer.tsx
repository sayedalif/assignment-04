import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* Left side - Brand/Title */}
          <div className="flex items-center space-x-2">
            <div className="text-2xl">📚</div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Library Management</h3>
            </div>
          </div>

          {/* Center - Quick Links */}
          <div className="flex items-center space-x-6 text-sm">
            <a 
              href="/books" 
              className="text-gray-600 hover:text-gray-800 transition-colors duration-200"
            >
              All Books
            </a>
            <a 
              href="/create-book" 
              className="text-gray-600 hover:text-gray-800 transition-colors duration-200"
            >
              Add Book
            </a>
            <a 
              href="/borrow-summary" 
              className="text-gray-600 hover:text-gray-800 transition-colors duration-200"
            >
              Borrow Summary
            </a>
          </div>

          {/* Right side - Copyright */}
          <div className="text-center md:text-right">
            <p className="text-sm text-gray-600">
              © {currentYear} Library System
            </p>
          </div>
        </div>

        {/* Bottom divider line */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          <p className="text-center text-xs text-gray-500">
            A minimal library management solution for book lovers
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;