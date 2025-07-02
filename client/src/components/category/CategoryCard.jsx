import { Link } from 'react-router-dom';
import { FiChevronRight } from 'react-icons/fi';

const CategoryCard = ({ category }) => {
  return (
    <Link 
      to={`/categories/${category._id}`}
      className="block group relative overflow-hidden rounded-xl shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-white"
    >
      <div className="relative h-48">
        {category.image?.url ? (
          <img
            src={category.image.url}
            alt={category.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
            <span className="text-indigo-400 font-medium">No image</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 p-5">
        <h3 className="text-xl font-bold text-white mb-1 group-hover:text-indigo-100 transition-colors">{category.name}</h3>
        {category.description && (
          <p className="text-sm text-gray-200 line-clamp-2 mb-3 opacity-80 group-hover:opacity-100 transition-opacity">{category.description}</p>
        )}
        
        <div className="flex items-center text-white text-sm font-medium opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
          Browse Products <FiChevronRight className="ml-1" />
        </div>
      </div>
    </Link>
  );
};

export default CategoryCard; 