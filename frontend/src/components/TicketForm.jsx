import { useState } from 'react';

const categories = ['INCIDENT', 'MAINTENANCE', 'SECURITY', 'FACILITY', 'OTHER'];
const priorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

export default function TicketForm({ onSubmit, loading }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'INCIDENT',
    priority: 'MEDIUM',
  });
  const [errors, setErrors] = useState({});
  const [files, setFiles] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFiles = (e) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length > 3) {
      setErrors((prev) => ({ ...prev, files: 'You can upload up to 3 images only.' }));
      return;
    }
    setErrors((prev) => ({ ...prev, files: undefined }));
    setFiles(selected);
  };

  const validate = () => {
    const nextErrors = {};
    if (!formData.title.trim()) nextErrors.title = 'Title is required.';
    if (!formData.description.trim()) nextErrors.description = 'Description is required.';
    if (formData.title.length > 150) nextErrors.title = 'Title max length is 150.';
    if (formData.description.length > 1000) nextErrors.description = 'Description max length is 1000.';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(formData, files);
  };

  return (
    <form className="card" onSubmit={submit}>
      <h2>Create Ticket</h2>
      <div className="field">
        <label>Title</label>
        <input name="title" value={formData.title} onChange={handleChange} />
        {errors.title && <small className="error">{errors.title}</small>}
      </div>

      <div className="field">
        <label>Description</label>
        <textarea
          name="description"
          rows={5}
          value={formData.description}
          onChange={handleChange}
        />
        {errors.description && <small className="error">{errors.description}</small>}
      </div>

      <div className="row-fields">
        <div className="field">
          <label>Category</label>
          <select name="category" value={formData.category} onChange={handleChange}>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label>Priority</label>
          <select name="priority" value={formData.priority} onChange={handleChange}>
            {priorities.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="field">
        <label>Images (max 3)</label>
        <input type="file" accept="image/*" multiple onChange={handleFiles} />
        {errors.files && <small className="error">{errors.files}</small>}
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Submitting...' : 'Submit Ticket'}
      </button>
    </form>
  );
}
