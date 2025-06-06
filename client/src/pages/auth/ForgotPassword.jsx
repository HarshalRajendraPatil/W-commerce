import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useSelector, useDispatch } from 'react-redux';
import { forgotPassword, reset } from '../../redux/slices/authSlice';
import FormInput from '../../components/FormInput';

// Validation schema
const ForgotPasswordSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required')
});

function ForgotPassword() {
  const dispatch = useDispatch();
  
  const { isLoading, isSuccess } = useSelector((state) => state.auth);
  
  useEffect(() => {
    // Reset state on unmount
    return () => {
      dispatch(reset());
    };
  }, [dispatch]);
  
  const handleSubmit = (values) => {
    dispatch(forgotPassword(values.email));
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
            Forgot Password
          </h2>
          <p className="text-gray-600">
            Enter your email to receive a password reset link
          </p>
        </div>
        
        <Formik
          initialValues={{ email: '' }}
          validationSchema={ForgotPasswordSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="mt-8 space-y-6">
              <FormInput
                name="email"
                type="email"
                placeholder="Email address"
                label="Email Address"
                autoComplete="email"
              />
              
              <div>
                <button
                  type="submit"
                  disabled={isLoading || isSubmitting || isSuccess}
                  className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Sending...' : 
                   isSuccess ? 'Email Sent!' : 
                   'Send Reset Link'}
                </button>
              </div>
              
              <div className="text-center mt-4">
                <p className="text-sm text-gray-600">
                  Remember your password?{' '}
                  <Link to="/login" className="text-blue-600 hover:text-blue-500">
                    Back to login
                  </Link>
                </p>
              </div>
              
              {isSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-md p-4 mt-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-green-700">
                        We've sent a password reset link to your email address. Please check your inbox.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}

export default ForgotPassword; 