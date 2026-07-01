import { useState, useCallback } from "react";

export function useApi(apiFunc) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    let silent = false;
    let apiArgs = args;

    if (args.length > 0) {
      const lastArg = args[args.length - 1];
      if (lastArg && typeof lastArg === "object" && lastArg.silent === true) {
        silent = true;
        apiArgs = args.slice(0, -1);
      }
    }

    if (!silent) {
      setLoading(true);
    }
    setError(null);
    try {
      const result = await apiFunc(...apiArgs);
      setData(result);
      return result;
    } catch (err) {
      setError(err.message || "Đã xảy ra lỗi!");
      throw err;
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, [apiFunc]);

  return { data, loading, error, execute, setData };
}
