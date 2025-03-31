import { useState, useEffect } from "react";
import { fetchApprovedSubmissions, formatSubmissionsForGallery } from "../utils/fetchSupabase";

interface IAItem {
  id: string;
  pdf: string | null;
  images: string[];
  tags: string[]; // Store all tags for filtering
  title?: string;
  creator?: string;
  gradeLevel?: string;
}

const Gallery = () => {
  const [ias, setIAs] = useState<IAItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Available filter categories
  const filterCategories = {
    material: ["Alloy", "Wood", "Plastic", "Glass", "Fabric", "Composite"],
    color: ["Red", "Blue", "Green", "Black", "White", "Yellow"],
    function: [
      "Organization & Storage",
      "Life Improvement & Decor",
      "Health & Wellness",
      "Innovative Gadgets & Tools",
      "Accessibility & Mobility Solutions"
    ]
  };

  useEffect(() => {
    async function loadApprovedIAs() {
      setLoading(true);
      try {
        const submissions = await fetchApprovedSubmissions();
        const formattedSubmissions = formatSubmissionsForGallery(submissions);
        setIAs(formattedSubmissions);
      } catch (error) {
        console.error("Failed to load gallery items:", error);
      } finally {
        setLoading(false);
      }
    }
    
    loadApprovedIAs();
  }, []);

  const handleFilterSelect = (category: string, value: string) => {
    setSelectedCategory(category);
    setActiveFilter(value);
  };

  const clearFilters = () => {
    setSelectedCategory(null);
    setActiveFilter(null);
  };

  // Filter IAs based on selected filter
  const filteredIAs = activeFilter 
    ? ias.filter(ia => 
        ia.tags.some(tag => tag === `${selectedCategory}_${activeFilter}`)
      )
    : ias;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Blueprint Gallery</h1>
      
      {/* Filter Controls */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2 justify-center mb-4">
          {Object.entries(filterCategories).map(([category, values]) => (
            <div key={category} className="flex flex-col items-center">
              <h3 className="font-semibold capitalize mb-2">{category}</h3>
              <div className="flex flex-wrap gap-1">
                {values.map(value => (
                  <button
                    key={value}
                    onClick={() => handleFilterSelect(category, value)}
                    className={`px-3 py-1 text-sm rounded-full transition-colors ${
                      activeFilter === value && selectedCategory === category
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 hover:bg-gray-300"
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        {activeFilter && (
          <div className="flex justify-center">
            <button 
              onClick={clearFilters}
              className="px-4 py-2 bg-red-100 text-red-800 rounded-full hover:bg-red-200 transition-colors"
            >
              Clear Filter: {activeFilter}
            </button>
          </div>
        )}
      </div>
      
      {/* Gallery Grid */}
      {filteredIAs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-500">No IA projects found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredIAs.map((ia) => (
            <div key={ia.id} className="border rounded-lg overflow-hidden shadow-lg transition-transform hover:scale-105">
              {/* Thumbnail/Image */}
              <div className="aspect-w-16 aspect-h-9 bg-gray-100">
                {ia.images && ia.images.length > 0 ? (
                  <img
                    src={ia.images[0]}
                    alt={ia.title || "IA Project"}
                    className="object-cover w-full h-48"
                  />
                ) : (
                  <div className="flex items-center justify-center h-48 bg-gray-200">
                    <span className="text-gray-400">No image available</span>
                  </div>
                )}
              </div>
              
              {/* Content */}
              <div className="p-4">
                <h3 className="font-bold text-lg">{ia.title}</h3>
                <p className="text-gray-600">Created by {ia.creator}</p>
                {ia.gradeLevel && (
                  <p className="text-gray-500 text-sm mb-4">Grade {ia.gradeLevel}</p>
                )}
                
                {/* View PDF button */}
                {ia.pdf && (
                  <a
                    href={ia.pdf}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full py-2 px-4 bg-blue-500 text-white text-center rounded hover:bg-blue-600 transition-colors mt-4"
                  >
                    View Project
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Gallery; 