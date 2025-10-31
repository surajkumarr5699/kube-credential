import { useState } from 'react';
import { ShieldCheck, ShieldX } from 'lucide-react';
import CredentialForm from '../components/CredentialForm';
import CredentialDisplay from '../components/CredentialDisplay';
import Alert from '../components/Alert';
import { verifyCredential } from '../api';
import { Credential, VerificationResponse } from '../types';

const VerificationPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<VerificationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async (credential: Credential) => {
    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      const result = await verifyCredential(credential);
      setResponse(result);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to verify credential';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="px-4 py-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
            <ShieldCheck className="h-8 w-8 text-primary-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Verify Credential
          </h1>
          <p className="text-gray-600">
            Check if a credential has been issued and is valid
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Credential to Verify
            </h2>
            <CredentialForm
              onSubmit={handleVerify}
              isLoading={isLoading}
              buttonText="Verify Credential"
            />
          </div>

          <div className="space-y-4">
            {error && (
              <Alert
                type="error"
                message={error}
                onClose={() => setError(null)}
              />
            )}

            {response && (
              <>
                {response.verified ? (
                  <>
                    <div className="card bg-green-50 border-2 border-green-200">
                      <div className="flex items-center space-x-3 mb-4">
                        <ShieldCheck className="h-8 w-8 text-green-600" />
                        <div>
                          <h3 className="text-lg font-semibold text-green-900">
                            Credential Verified
                          </h3>
                          <p className="text-sm text-green-700">
                            {response.message}
                          </p>
                        </div>
                      </div>
                      <div className="text-sm text-green-800 space-y-1">
                        <p>
                          <strong>Verified by:</strong> {response.workerId}
                        </p>
                        <p>
                          <strong>Verification time:</strong>{' '}
                          {new Date(response.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {response.credential && (
                      <CredentialDisplay
                        credential={response.credential}
                        issuedBy={response.issuedBy}
                        issuedAt={response.issuedAt}
                      />
                    )}
                  </>
                ) : (
                  <div className="card bg-red-50 border-2 border-red-200">
                    <div className="flex items-center space-x-3 mb-4">
                      <ShieldX className="h-8 w-8 text-red-600" />
                      <div>
                        <h3 className="text-lg font-semibold text-red-900">
                          Verification Failed
                        </h3>
                        <p className="text-sm text-red-700">
                          {response.message}
                        </p>
                      </div>
                    </div>
                    <div className="text-sm text-red-800 space-y-1">
                      <p>
                        <strong>Checked by:</strong> {response.workerId}
                      </p>
                      <p>
                        <strong>Check time:</strong>{' '}
                        {new Date(response.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}

            {!response && !error && (
              <div className="card bg-gray-50 border-2 border-dashed border-gray-300">
                <div className="text-center py-12">
                  <ShieldCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    Enter credential details and click "Verify Credential" to check its validity
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationPage;
