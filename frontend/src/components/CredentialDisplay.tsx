import { Credential } from '../types';
import { Calendar, User, FileText, Clock } from 'lucide-react';

interface CredentialDisplayProps {
  credential: Credential;
  workerId?: string;
  timestamp?: string;
  issuedBy?: string;
  issuedAt?: string;
}

const CredentialDisplay: React.FC<CredentialDisplayProps> = ({
  credential,
  workerId,
  timestamp,
  issuedBy,
  issuedAt
}) => {
  return (
    <div className="bg-gradient-to-br from-primary-50 to-indigo-50 rounded-lg p-6 border-2 border-primary-200">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Credential Details</h3>
      
      <div className="space-y-3">
        <div className="flex items-start">
          <FileText className="h-5 w-5 text-primary-600 mt-0.5 mr-3" />
          <div>
            <p className="text-sm text-gray-600">Credential ID</p>
            <p className="font-semibold text-gray-900">{credential.id}</p>
          </div>
        </div>

        <div className="flex items-start">
          <User className="h-5 w-5 text-primary-600 mt-0.5 mr-3" />
          <div>
            <p className="text-sm text-gray-600">Holder Name</p>
            <p className="font-semibold text-gray-900">{credential.holderName}</p>
          </div>
        </div>

        <div className="flex items-start">
          <FileText className="h-5 w-5 text-primary-600 mt-0.5 mr-3" />
          <div>
            <p className="text-sm text-gray-600">Credential Type</p>
            <p className="font-semibold text-gray-900">{credential.credentialType}</p>
          </div>
        </div>

        <div className="flex items-start">
          <Calendar className="h-5 w-5 text-primary-600 mt-0.5 mr-3" />
          <div>
            <p className="text-sm text-gray-600">Issue Date</p>
            <p className="font-semibold text-gray-900">{credential.issueDate}</p>
          </div>
        </div>

        {credential.expiryDate && (
          <div className="flex items-start">
            <Calendar className="h-5 w-5 text-primary-600 mt-0.5 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Expiry Date</p>
              <p className="font-semibold text-gray-900">{credential.expiryDate}</p>
            </div>
          </div>
        )}

        {(workerId || issuedBy) && (
          <div className="mt-4 pt-4 border-t border-primary-200">
            <div className="flex items-start">
              <Clock className="h-5 w-5 text-primary-600 mt-0.5 mr-3" />
              <div>
                <p className="text-sm text-gray-600">
                  {issuedBy ? 'Issued By Worker' : 'Processed By Worker'}
                </p>
                <p className="font-semibold text-gray-900">{issuedBy || workerId}</p>
                {(timestamp || issuedAt) && (
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(issuedAt || timestamp || '').toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CredentialDisplay;
