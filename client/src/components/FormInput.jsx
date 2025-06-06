import { useField } from 'formik';

function FormInput({ label, ...props }) {
  const [field, meta] = useField(props);
  
  return (
    <div className="mb-4">
      {label && (
        <label 
          htmlFor={props.id || props.name} 
          className="block text-gray-700 font-medium mb-2"
        >
          {label}
        </label>
      )}
      
      <input
        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
          ${meta.touched && meta.error ? 'border-red-500' : 'border-gray-300'}`}
        {...field}
        {...props}
      />
      
      {meta.touched && meta.error ? (
        <div className="text-red-500 text-sm mt-1">{meta.error}</div>
      ) : null}
    </div>
  );
}

export default FormInput; 