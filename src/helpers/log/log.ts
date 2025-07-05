import axios from "axios";

class DiscordWebhookClient {
  private formatData(data: any): any {
    if (typeof data === "object") {
      return JSON.stringify(data);
    } else {
      return { content: String(data) };
    }
  }

  public async sendData(data: any): Promise<void> {
    try {
      const formattedData = this.formatData(data);
      await axios.post(process.env.WEBHOOK, formattedData, {
        headers: { "Content-Type": "application/json" },
      });
      console.log("Data sent successfully");
    } catch (error) {
      console.error("Error sending data:", error);
    }
  }
}

export default DiscordWebhookClient;
