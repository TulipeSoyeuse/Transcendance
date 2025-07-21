import { Message, User } from "./chatTypes.js";
import ChatClient from "./ChatClient.js";

export default class HistoryManager {
  private chatClient: ChatClient;

  constructor(chatClient: ChatClient) {
    this.chatClient = chatClient;
  }

  private async openFirstConv() {
      const convContainer = document.getElementById("conversation-container");
      const chatWindow = await this.chatClient.getBubbleHandler().loadTemplate("/chat/chat-window.html");
      if (!chatWindow || !convContainer) return;
      const p = document.getElementById("conv-placeholder");
      if (p) p.remove();
      convContainer.appendChild(chatWindow);
      const input = document.querySelector('textarea');
      this.chatClient.setInputListeners();
      this.chatClient.getOptionHandler().initDropdownListeners();
  }

  private async fetchConversationId(target: string): Promise<number | null> {
      try {
        const res = await fetch(`/api/chat/conversation?target=${target}`);
        const data = await res.json();
        if (res.status === 404) {
          console.log(data.message);
          return (null);
        } else if (res.status === 500) {
          console.error(data.message);
          return (null);
        }
        return (data.id);
      } catch (err) {
        console.error("Failed to fetch or parse JSON:", err);
        return (null);
      }
    }

    private async fetchMessageHistory(conversationId: number): Promise<Message[] | null> {
      try {
        const res = await fetch(`/api/chat/${conversationId}/messages`);
        const data = await res.json();
        if (res.status === 500) {
          console.error(data.message);
          return (null);
        }
        return (data);
      } catch (err) {
        console.error("Failed to fetch or parse JSON:", err);
        return (null);
      }
    }

    private async displayMessageHistory(targetId: string, conversationId: number) { // ! ADD ISSENT
      const messages = await this.fetchMessageHistory(conversationId);
      if (messages) {
        for (const entry of messages as any) {
          const message: Message = {
            content: entry.content,
            senderId: entry.sender_id.toString(),
            sentAt: entry.sent_at
          }
          const isSent = message.senderId === targetId;
          await this.chatClient.getBubbleHandler().addChatBubble(isSent, message, targetId!);
        }
      } else
        console.error("Failed to fetch messages for conversation ID:", conversationId);
    }

   async openChat(user: User) { // ! add isSent
      if (!document.getElementById("chat-window")) await this.openFirstConv();
      const chatBox = document.getElementById("conversation-box");
      const recipientName = document.getElementById("recipient-name");
      if (!chatBox || !recipientName) return;
      chatBox.innerHTML = "";
      recipientName.textContent = user.username;
      const conversationId = await this.fetchConversationId(user.userId);
      if (!conversationId) return;
      this.displayMessageHistory(user.userId, conversationId); // ! FIX user self !!!!!!!!!!!!!!!!!
      this.chatClient.getOptionHandler().getBlockManager().checkBlockedTarget();
  }
}