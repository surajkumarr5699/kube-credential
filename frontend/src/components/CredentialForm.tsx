import { useState } from 'react';
import { Credential } from '../types';

interface CredentialFormProps {
  onSubmit: (credential: Credential) => void;
  isLoading: boolean;
  buttonText: string;
}

const CredentialForm: React.FC<CredentialFormProps> = ({
  onSubmit,
  isLoading,
  buttonText
}) => {
  const [formData, setFormData] = useState<Credential>({
    id: '',
    holderName: '',
    credentialType: '',
    issueDate: new Date().toISOString().split('T')[0],
    expiryDate: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = { ...formData };
    if (!submitData.expiryDate) {
      delete submitData.expiryDate;
    }
    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="id" className="label">
          Credential ID *
        </label>
        <input
          type="text"
          id="id"
          name="id"
          value={formData.id}
          onChange={handleChange}
          className="input"
          placeholder="e.g., CRED-2025-001"
          required
        />
      </div>

      <div>
        <label htmlFor="holderName" className="label">
          Holder Name *
        </label>
        <input
          type="text"
          id="holderName"
          name="holderName"
          value={formData.holderName}
          onChange={handleChange}
          className="input"
          placeholder="e.g., John Doe"
          required
        />
      </div>

      <div>
        <label htmlFor="credentialType" className="label">
          Credential Type *
        </label>
        <select
          id="credentialType"
          name="credentialType"
          value={formData.credentialType}
          onChange={handleChange}
          className="input"
          required
        >
          <option value="">Select type...</option>
          <option value="Driver License">Driver License</option>
          <option value="Passport">Passport</option>
          <option value="ID Card">ID Card</option>
          <option value="Certificate">Certificate</option>
          <option value="Diploma">Diploma</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="issueDate" className="label">
            Issue Date *
          </label>
          <input
            type="date"
            id="issueDate"
            name="issueDate"
            value={formData.issueDate}
            onChange={handleChange}
            className="input"
            required
          />
        </div>

        <div>
          <label htmlFor="expiryDate" className="label">
            Expiry Date (Optional)
          </label>
          <input
            type="date"
            id="expiryDate"
            name="expiryDate"
            value={formData.expiryDate}
            onChange={handleChange}
            className="input"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Processing...' : buttonText}
      </button>
    </form>
  );
};

export default CredentialForm;
