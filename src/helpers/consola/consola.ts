const color: any = {
  reset: "\x1b[0m",
  black: "\x1b[30m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  grey: "\x1b[90m",

  backgroundBlack: "\x1b[40m",
  backgroundRed: "\x1b[41m",
  backgroundGreen: "\x1b[42m",
  backgroundYellow: "\x1b[43m",
  backgroundBlue: "\x1b[44m",
  backgroundMagenta: "\x1b[45m",
  backgroundCyan: "\x1b[46m",
  backgroundWhite: "\x1b[47m",
  backgroundGrey: "\x1b[100m",
};

function getCurrentTime() {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const seconds = now.getSeconds().toString().padStart(2, "0");
  return `${color.white}[${color.cyan}${hours}${color.white}:${color.cyan}${minutes}${color.white}:${color.cyan}${seconds}${color.white}]${color.reset}`;
}

const consola = {
  success: function (message?: any): void {
    /**
     * @param {any} message
     * @returns {void}
     */

    const text = `${getCurrentTime()} ${color.white}[${color.green}SUCCESS${
      color.white
    }] ${color.reset}${message}`;
    console.log(text);
  },

  error: function (message?: any): void {
    /**
     * @param {any} message
     * @returns {void}
     */

    const text = `${getCurrentTime()} ${color.white}[${color.red}ERROR${
      color.white
    }] ${color.reset}${message}`;
    console.log(text);
  },

  warn: function (message?: any): void {
    /**
     * @param {any} message
     * @returns {void}
     */

    const text = `${getCurrentTime()} ${color.white}[${color.yellow}WARN${
      color.white
    }] ${color.reset}${message}`;
    console.log(text);
  },

  info: function (message?: any): void {
    /**
     * @param {any} message
     * @returns {void}
     */

    const text = `${getCurrentTime()} ${color.white}[${color.blue}INFO${
      color.white
    }] ${color.reset}${message}`;
    console.log(text);
  },

  debug: function (message?: any): void {
    /**
     * @param {any} message
     * @returns {void}
     */

    const text = `${getCurrentTime()} ${color.white}[${color.grey}DEBUG${
      color.white
    }] ${color.reset}${message}`;
    console.log(text);
  },
};

export default consola;