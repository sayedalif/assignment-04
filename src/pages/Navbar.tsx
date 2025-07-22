import { Link } from "react-router";

const Navbar = () => {
  return (
    <nav className='bg-gray-800 p-4 flex justify-center items-center text-white my-3 rounded-md'>
      <div className="flex space-x-4 cursor-pointer">
        <Link to={'/books'}>All Books</Link>
        <Link to={'/create-book'}>Add a new Book</Link>
        <Link to={'/borrow-summary'}>Borrow Summary</Link>
      </div>
    </nav>
  );
};

export default Navbar;
