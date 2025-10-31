import { useState } from "react";
import { FileCheck } from "lucide-react";
import CredentialForm from "../components/CredentialForm";
import CredentialDisplay from "../components/CredentialDisplay";
import Alert from "../components/Alert";
import { issueCredential } from "../api";
import axios from "axios";
import { Credential, IssuanceResponse } from "../types";

const IssuancePage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<IssuanceResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleIssue = async (credential: Credential) => {
    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      const result = await issueCredential(credential);
      setResponse(result);
    } catch (err: any) {
      let errorMessage = "Failed to issue credential";
      if (axios.isAxiosError(err)) {
        const data: any = err.response?.data;
        errorMessage =
          data?.error ?? data?.message ?? err.message ?? errorMessage;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      } else {
        errorMessage = String(err);
      }
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
            <FileCheck className="h-8 w-8 text-primary-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Issue Credential
          </h1>
          <p className="text-gray-600">
            Create and issue a new credential to a holder
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Credential Information
            </h2>
            <CredentialForm
              onSubmit={handleIssue}
              isLoading={isLoading}
              buttonText="Issue Credential"
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
                {response.success ? (
                  <>
                    <Alert
                      type="success"
                      message={response.message}
                      onClose={() => setResponse(null)}
                    />
                    {response.credential && (
                      <CredentialDisplay
                        credential={response.credential}
                        workerId={response.workerId}
                        timestamp={response.timestamp}
                      />
                    )}
                  </>
                ) : (
                  <Alert
                    type="warning"
                    message={response.message}
                    onClose={() => setResponse(null)}
                  />
                )}
              </>
            )}

            {!response && !error && (
              <div className="card bg-gray-50 border-2 border-dashed border-gray-300">
                <div className="text-center py-12">
                  <FileCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    Fill in the form and click "Issue Credential" to create a
                    new credential
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

export default IssuancePage;
