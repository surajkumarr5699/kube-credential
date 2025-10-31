import { AlertCircle, CheckCircle, XCircle, Info } from 'lucide-react';

interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  onClose?: () => void;
}

const Alert: React.FC<AlertProps> = ({ type, message, onClose }) => {
  const styles = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      icon: <CheckCircle className="h-5 w-5 text-green-400" />
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: <XCircle className="h-5 w-5 text-red-400" />
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      icon: <AlertCircle className="h-5 w-5 text-yellow-400" />
    },
    info: {
      bg: 'bg-primary-50',
      border: 'border-primary-200',
      text: 'text-primary-800',
      icon: <Info className="h-5 w-5 text-primary-400" />
    }
  };

  const style = styles[type];

  return (
    <div className={`${style.bg} ${style.border} border rounded-lg p-4 mb-4`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">{style.icon}</div>
        <div className="ml-3 flex-1">
          <p className={`text-sm font-medium ${style.text}`}>{message}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className={`ml-3 inline-flex ${style.text} hover:opacity-75`}
          >
            <span className="sr-only">Close</span>
            <XCircle className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Alert;
