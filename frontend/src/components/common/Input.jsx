import { useId } from "react";

const Input = ({ label, id, type = "text", className = "", ...props }) => {
  const generatedId = useId().replace(/:/g, "");
  const inputId = id || props.name || `input-${generatedId}`;
  const ariaLabel =
    props["aria-label"] ||
    (typeof label === "string" && label.trim()) ||
    props.placeholder ||
    (typeof props.name === "string" && props.name.trim()) ||
    undefined;

  return (
    <div>
      {label ? (
        <label
          htmlFor={inputId}
          className="block mb-1 font-medium text-gray-800 dark:text-gray-200"
        >
          {label}
        </label>
      ) : null}
      <input
        id={inputId}
        type={type}
        {...props}
        aria-label={ariaLabel}
        className={`w-full px-4 py-2.5 rounded-xl
      bg-white/60 dark:bg-gray-700/50
      border border-gray-300 dark:border-gray-600
      text-gray-900 dark:text-gray-200
      shadow-inner backdrop-blur-md
      focus:ring-2 focus:ring-indigo-500 ${className}`.trim()}
      />
    </div>
  );
};

export default Input;
