import { FileText, Plus, Edit, Trash2, Copy } from "lucide-react";
import { useState, useEffect } from "react";

const CoverLetterTab = () => {
  const [coverLetters, setCoverLetters] = useState([]);

  // Load cover letters from localStorage on component mount
  useEffect(() => {
    const savedLetters = localStorage.getItem("coverLetters");
    if (savedLetters) {
      setCoverLetters(JSON.parse(savedLetters));
    }
  }, []);

  // Save to localStorage whenever coverLetters changes
  useEffect(() => {
    localStorage.setItem("coverLetters", JSON.stringify(coverLetters));
  }, [coverLetters]);

  const [showModal, setShowModal] = useState(false);
  const [editingLetter, setEditingLetter] = useState(null);
  const [formData, setFormData] = useState({ title: "", content: "" });

  const handleAddNew = () => {
    setEditingLetter(null);
    setFormData({ title: "", content: "" });
    setShowModal(true);
  };

  const handleEdit = (letter) => {
    setEditingLetter(letter);
    setFormData({ title: letter.title, content: letter.content });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    setCoverLetters(coverLetters.filter((letter) => letter.id !== id));
  };

  const handleCopy = (content) => {
    navigator.clipboard.writeText(content);
    // You could add a toast notification here
  };

  const handleSave = () => {
    if (!formData.title.trim() || !formData.content.trim()) return;

    if (editingLetter) {
      // Update existing
      setCoverLetters(
        coverLetters.map((letter) =>
          letter.id === editingLetter.id
            ? { ...letter, title: formData.title, content: formData.content }
            : letter
        )
      );
    } else {
      // Add new
      const newLetter = {
        id: Date.now(),
        title: formData.title,
        content: formData.content,
      };
      setCoverLetters([...coverLetters, newLetter]);
    }

    setShowModal(false);
    setFormData({ title: "", content: "" });
    setEditingLetter(null);
  };

  const handleCancel = () => {
    setShowModal(false);
    setFormData({ title: "", content: "" });
    setEditingLetter(null);
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Add Button */}
      <div className="flex justify-end">
        <button
          onClick={handleAddNew}
          className="flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors duration-200"
        >
          <Plus className="w-4 h-4" />
          <span>Add Cover Letter</span>
        </button>
      </div>

      {/* Cover Letters List */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {coverLetters.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No cover letters yet.</p>
            <p className="text-xs text-gray-500 mt-1">
              Click "Add Cover Letter" to create your first one.
            </p>
          </div>
        ) : (
          coverLetters.map((letter) => (
            <div
              key={letter.id}
              className="bg-gray-800 rounded-lg p-3 border border-gray-700 flex items-center justify-between"
            >
              <h3 className="text-sm font-medium text-white">{letter.title}</h3>
              <div className="flex space-x-1">
                <button
                  onClick={() => handleEdit(letter)}
                  className="p-1 text-gray-400 hover:text-blue-400 transition-colors duration-200"
                  title="Edit"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleCopy(letter.content)}
                  className="p-1 text-gray-400 hover:text-green-400 transition-colors duration-200"
                  title="Copy"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(letter.id)}
                  className="p-1 text-gray-400 hover:text-red-400 transition-colors duration-200"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-96 max-h-[500px] flex flex-col">
            <h2 className="text-lg font-medium mb-4">
              {editingLetter ? "Edit Cover Letter" : "Add New Cover Letter"}
            </h2>

            <div className="space-y-4 flex-1">
              <div>
                <label className="block text-xs text-gray-300 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-xs focus:outline-none focus:border-blue-500"
                  placeholder="e.g., Web Developer Profile"
                />
              </div>

              <div className="flex-1">
                <label className="block text-xs text-gray-300 mb-1">
                  Content
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  className="w-full h-48 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-xs focus:outline-none focus:border-blue-500 resize-none"
                  placeholder="Write your cover letter content here..."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-gray-400 hover:text-white text-xs transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!formData.title.trim() || !formData.content.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-xs rounded-lg transition-colors duration-200"
              >
                {editingLetter ? "Update" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoverLetterTab;
