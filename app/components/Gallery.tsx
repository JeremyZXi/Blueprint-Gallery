import { useState, useEffect, useMemo } from "react";
import { fetchApprovedSubmissions, formatSubmissionsForGallery } from "../utils/fetchSupabase";
import IADetailView from "./IADetailView";
import Fuse from 'fuse.js';
import { Search } from 'lucide-react';

interface IAItem {
  id: string;
  pdf: string | null;
  images: string[];
  tags: string[]; // Store all tags for filtering
  title?: string;
  creator?: string;
  gradeLevel?: string;
  submissionDate?: string;
  description?: string;
}

const Gallery = () => {
  const [ias, setIAs] = useState<IAItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedIA, setSelectedIA] = useState<IAItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

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

  // Initialize Fuse for fuzzy search
  const fuseOptions = {
    keys: ['title', 'creator', 'description', 'tags'],
    threshold: 0.4, // Lower value means more exact matching (0.0 = exact, 1.0 = match everything)
    includeScore: true
  };

  const fuse = useMemo(() => 
    new Fuse(ias, fuseOptions), 
    [ias]
  );

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
    // Clear search query when using category filters
    setSearchQuery('');
  };

  const clearFilters = () => {
    setSelectedCategory(null);
    setActiveFilter(null);
  };

  const handleIAClick = (ia: IAItem) => {
    setSelectedIA(ia);
  };

  const closeDetailView = () => {
    setSelectedIA(null);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    // Clear category filters when searching
    if (e.target.value) {
      setSelectedCategory(null);
      setActiveFilter(null);
    }
  };

  // Extract tag categories for display
  const getCategoryFromTags = (ia: IAItem, categoryPrefix: string): string[] => {
    return ia.tags
        .filter(tag => tag.startsWith(`${categoryPrefix}_`))
        .map(tag => tag.replace(`${categoryPrefix}_`, ''));
  };

  // Filter IAs based on selected filter and search query
  const filteredIAs = useMemo(() => {
    // If we have a search query, use fuzzy search
    if (searchQuery.trim()) {
      const searchResults = fuse.search(searchQuery);
      return searchResults.map(result => result.item);
    }
    
    // Otherwise use category filters
    if (activeFilter && selectedCategory) {
      return ias.filter(ia => 
        ia.tags.some(tag => tag === `${selectedCategory}_${activeFilter}`)
      );
    }
    
    // No filters, return all
    return ias;
  }, [ias, activeFilter, selectedCategory, searchQuery, fuse]);

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

        {/* Search Bar */}
        <div className="mb-8 max-w-xl mx-auto">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Search by title, creator, or keywords..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
        </div>

        {/* Filter Controls - Only show when not searching */}
        {!searchQuery && (
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
        )}

        {/* Search query display */}
        {searchQuery && (
          <div className="flex justify-center mb-6">
            <div className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full flex items-center">
              <span>Search results for: <strong>{searchQuery}</strong></span>
              <button 
                onClick={() => setSearchQuery('')}
                className="ml-2 text-blue-600 hover:text-blue-800"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Gallery Grid */}
        {filteredIAs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl text-gray-500">No projects found matching your criteria.</p>
              <button 
                onClick={() => {
                  setSearchQuery('');
                  clearFilters();
                }}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Show All Projects
              </button>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredIAs.map((ia) => (
                  <div
                      key={ia.id}
                      className="border rounded-lg overflow-hidden shadow-lg transition-transform hover:scale-105 cursor-pointer"
                      onClick={() => handleIAClick(ia)}
                  >
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

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {ia.tags.slice(0, 3).map((tag, index) => (
                          <span 
                            key={index}
                            className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
                          >
                            {tag.split('_')[1]}
                          </span>
                        ))}
                      </div>

                      {/* View button */}
                      <button
                          className="block w-full py-2 px-4 bg-blue-500 text-white text-center rounded hover:bg-blue-600 transition-colors mt-4"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleIAClick(ia);
                          }}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
              ))}
            </div>
        )}

        {/* Detail View Modal */}
        {selectedIA && (
            <IADetailView
                id={selectedIA.id}
                title={selectedIA.title || "Untitled Project"}
                creator={selectedIA.creator}
                submissionDate={selectedIA.submissionDate}
                category={getCategoryFromTags(selectedIA, 'function')[0]}
                tags={[
                  ...getCategoryFromTags(selectedIA, 'material'),
                  ...getCategoryFromTags(selectedIA, 'color'),
                  ...getCategoryFromTags(selectedIA, 'function')
                ]}
                description={selectedIA.description}
                images={selectedIA.images}
                pdfUrl={selectedIA.pdf || undefined}
                onClose={closeDetailView}
            />
        )}
      </div>
  );
};

export default Gallery; 