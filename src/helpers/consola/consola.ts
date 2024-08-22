enum TextColor {
  Reset = "\x1b[0m",
  Black = "\x1b[30m",
  Red = "\x1b[31m",
  Green = "\x1b[32m",
  Yellow = "\x1b[33m",
  Blue = "\x1b[34m",
  Magenta = "\x1b[35m",
  Cyan = "\x1b[36m",
  White = "\x1b[37m",
  Grey = "\x1b[90m",
}

/**
 * Gets the current time formatted as HH:MM:SS.
 *
 * @returns The current time as a formatted string.
 */
function getCurrentTime(): string {
  const now: Date = new Date();
  const hours: string = now.getHours().toString().padStart(2, "0");
  const minutes: string = now.getMinutes().toString().padStart(2, "0");
  const seconds: string = now.getSeconds().toString().padStart(2, "0");
  return `${TextColor.White}[${TextColor.Cyan}${hours}${TextColor.White}:${TextColor.Cyan}${minutes}${TextColor.White}:${TextColor.Cyan}${seconds}${TextColor.White}]${TextColor.Reset}`;
}

/**
 * Interface for logger functions.
 *
 * @param message - The message to log.
 */
interface Logger {
  (message?: any): void;
}

/**
 * Creates a logger function for the given log level and color.
 *
 * @param level - The log level.
 * @param color - The color for the log level text.
 * @returns A logger function.
 */
const createLogger = (level: string, color: TextColor): Logger => {
  return (message?: any): void => {
    const text = `${getCurrentTime()} ${TextColor.White}[${color}${level}${
      TextColor.White
    }] ${TextColor.Reset}${message !== undefined ? message : " "}`;
    console.log(text);
  };
};

/**
 * The Consola logger API.
 */
const consola = {
  success: createLogger("SUCCESS", TextColor.Green),
  error: createLogger("ERROR", TextColor.Red),
  warn: createLogger("WARN", TextColor.Yellow),
  info: createLogger("INFO", TextColor.Blue),
  debug: createLogger("DEBUG", TextColor.Grey),
};

export default consola;