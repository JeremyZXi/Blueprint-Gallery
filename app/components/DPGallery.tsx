import { useState, useEffect, useMemo } from "react";
import { fetchApprovedDPSubmissions, formatSubmissionsForGallery, fetchColorTags, fetchMaterialTags, type ColorTag, type MaterialTag } from "../utils/fetchSupabase";
import IADetailView from "./IADetailView";
import Fuse from 'fuse.js';
import { Search } from 'lucide-react';

interface IAItem {
  id: string;
  pdf: string | null;
  images: string[];
  tags: string[]; // Store all tags for filtering test test
  title?: string;
  creator?: string;
  gradeLevel?: string;
  submissionDate?: string;
  description?: string;
}

const DPGallery = () => {
  const [ias, setIAs] = useState<IAItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedIA, setSelectedIA] = useState<IAItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<{[key: string]: string[]}>({
    material: [],
    color: [],
    function: []
  });
  
  // 标签状态
  const [colorTags, setColorTags] = useState<ColorTag[]>([]);
  const [materialTags, setMaterialTags] = useState<MaterialTag[]>([]);
  const [isLoadingTags, setIsLoadingTags] = useState(true);

  // Available filter categories
  const functions = [
    "Organization & Storage",
    "Life Improvement & Decor",
    "Health & Wellness",
    "Innovative Gadgets & Tools",
    "Accessibility & Mobility Solutions"
  ];

  // 使用从数据库获取的标签构建filterCategories
  const filterCategories = useMemo(() => ({
    material: [...materialTags.map(tag => tag.name), 'Other'],
    color: [...colorTags.map(tag => tag.name), 'Other'],
    function: [...functions, 'Other']
  }), [materialTags, colorTags]);

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

  // 加载动态标签
  useEffect(() => {
    const loadTags = async () => {
      try {
        setIsLoadingTags(true);
        const [colorTagsData, materialTagsData] = await Promise.all([
          fetchColorTags(),
          fetchMaterialTags()
        ]);
        
        setColorTags(colorTagsData);
        setMaterialTags(materialTagsData);
      } catch (error) {
        console.error("Error loading tags:", error);
      } finally {
        setIsLoadingTags(false);
      }
    };
    
    loadTags();
  }, []);

  useEffect(() => {
    async function loadApprovedIAs() {
      setLoading(true);
      try {
        const submissions = await fetchApprovedDPSubmissions();
        console.log('Fetched DP submissions:', submissions);
        
        const formattedSubmissions = formatSubmissionsForGallery(submissions);
        console.log('Formatted DP submissions:', formattedSubmissions);
        
        if (formattedSubmissions.length === 0) {
          console.log('No DP submissions found, gallery will be empty');
          setIAs([]);
        } else {
          setIAs(formattedSubmissions);
        }
      } catch (error) {
        console.error("Failed to load DP gallery items:", error);
        setIAs([]);
      } finally {
        setLoading(false);
      }
    }
    
    loadApprovedIAs();
  }, []);

  // Filter handling
  const handleFilterSelect = (category: string, value: string) => {
    setSelectedFilters(prev => {
      const updated = { ...prev };
      
      if (updated[category].includes(value)) {
        // Remove filter if already selected
        updated[category] = updated[category].filter(v => v !== value);
      } else {
        // Add filter
        updated[category] = [...updated[category], value];
      }
      
      return updated;
    });
  };
  
  const clearFilters = () => {
    setSelectedFilters({
      material: [],
      color: [],
      function: []
    });
    setSearchQuery('');
  };
  
  const handleIAClick = (ia: IAItem) => {
    setSelectedIA(ia);
  };
  
  const closeDetailView = () => {
    setSelectedIA(null);
  };
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  // Helper function to extract category tags from IA
  const getCategoryFromTags = (ia: IAItem, categoryPrefix: string): string[] => {
    return ia.tags
      .filter(tag => tag.startsWith(categoryPrefix))
      .map(tag => tag.substring(categoryPrefix.length));
  };
  
  // Filter IAs based on selected filters and search query
  const filteredIAs = useMemo(() => {
    let results = [...ias];
    
    // Apply tag filters
    const hasActiveFilters = Object.values(selectedFilters).some(filters => filters.length > 0);
    
    if (hasActiveFilters) {
      results = results.filter(ia => {
        return Object.entries(selectedFilters).every(([category, selectedValues]) => {
          // Skip category if no filters selected
          if (!selectedValues.length) return true;
          
          const prefix = `${category}_`;
          const iaValues = getCategoryFromTags(ia, prefix);
          
          // Check if any of the IA's values for this category match any selected filter values
          return selectedValues.some(selectedValue => iaValues.includes(selectedValue));
        });
      });
    }
    
    // Apply search query
    if (searchQuery.trim()) {
      const searchResults = fuse.search(searchQuery);
      results = searchResults.map(result => result.item);
    }
    
    return results;
  }, [ias, selectedFilters, searchQuery, fuse]);

  return (
    <div className="py-16 px-4 lg:px-8">
      <div className="container mx-auto">
        {/* Filter and search section */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row justify-between mb-6">
            <h2 className="text-3xl font-serif mb-4 md:mb-0">DP Design Projects</h2>
            
            {/* Search box */}
            <div className="relative w-full md:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
          </div>
          
          {/* Filter categories */}
          <div className="space-y-4 mb-4">
            {Object.entries(filterCategories).map(([category, values]) => (
              <div key={category} className="w-full">
                <h3 className="text-lg font-medium mb-2 capitalize">{category}</h3>
                <div className="flex flex-wrap gap-2">
                  {values.map(value => {
                    const isSelected = selectedFilters[category].includes(value);
                    return (
                      <button
                        key={value}
                        onClick={() => handleFilterSelect(category, value)}
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          isSelected
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {value}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          
          {/* Clear filters button */}
          <button
            onClick={clearFilters}
            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
          >
            Clear all filters
          </button>
        </div>
        
        {/* Gallery grid */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8`}>
          {loading ? (
            // Loading skeleton
            Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-300 h-60 rounded-lg mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              </div>
            ))
          ) : filteredIAs.length === 0 ? (
            // No results
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 text-lg">No projects found matching your filters.</p>
              <button
                onClick={clearFilters}
                className="mt-4 text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            // Gallery items
            filteredIAs.map((ia) => {
              // Random height for masonry-like effect
              const randomHeight = () => {
                const heights = ['h-48', 'h-56', 'h-64'];
                return heights[Math.floor(Math.random() * heights.length)];
              };
              
              return (
                <div 
                  key={ia.id} 
                  className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transform transition hover:scale-[1.02]"
                  onClick={() => handleIAClick(ia)}
                >
                  <div className={`${randomHeight()} w-full bg-gray-200`}>
                    {ia.images && ia.images.length > 0 ? (
                      <img 
                        src={ia.images[0]} 
                        alt={ia.title} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback image on error
                          e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Image+Not+Available';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500">
                        No image available
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-medium mb-1 truncate">{ia.title}</h3>
                    <p className="text-gray-600 text-sm mb-2">by {ia.creator}</p>
                    <p className="text-gray-500 text-xs">Grade {ia.gradeLevel}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      
      {/* Detail view modal */}
      {selectedIA && (
        <IADetailView 
          id={selectedIA.id}
          title={selectedIA.title || ''}
          creator={selectedIA.creator}
          submissionDate={selectedIA.submissionDate}
          description={selectedIA.description}
          images={selectedIA.images}
          pdfUrl={selectedIA.pdf || ''}
          onClose={closeDetailView} 
        />
      )}
    </div>
  );
};

export default DPGallery; 