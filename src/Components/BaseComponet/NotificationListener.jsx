import { useEffect } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import axiosInstance from "./axiosInstance";
function NotificationListener() {

    useEffect(() => {
        if (Notification.permission !== "granted") {
            Notification.requestPermission();
        }

        const user = JSON.parse(localStorage.getItem("userData"));
        const employeeId = user?.employeeId;
        const adminId = user?.adminId;

        const client = new Client({
            webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
            reconnectDelay: 5000,

            onConnect: () => {
                // 👉 EMPLOYEE notifications
                if (employeeId) {
                    client.subscribe(
                        `/topic/updateTasknotificationsToEmployee/${employeeId}`,
                        (message) => handleStatusUpdateNotification(message)
                    );

                    client.subscribe(
                        `/topic/createTasknotifications/${employeeId}`,
                        (message) => handleNotification(message)
                    );
                }

                // 👉 ADMIN notifications
                if (adminId) {
                    client.subscribe(
                        `/topic/updateTasknotificationsToAdmin/${adminId}`,
                        (message) => handleStatusUpdateNotification(message)
                    );
                }
            },
        });

        const handleNotification = (message) => {
            let data;
            try {
                data = JSON.parse(message.body);
            } catch {
                data = message.body;
            }

            const bodyText =
                typeof data === "string"
                    ? data
                    : `Subject: ${data.subject}
                       Priority: ${data.priority}
                       Start: ${data.startDate}
                       End: ${data.endDate}
                       Created by: ${data.createdBy}`;

            if (Notification.permission === "granted") {
                new Notification("New Task", {
                    body: bodyText,
                    icon: "/Images/Mtech_Logo.jpg",
                });
            }
        };


        const handleStatusUpdateNotification = (message) => {
            let data;
            try {
                data = JSON.parse(message.body);
            } catch {
                data = message.body;
            }

            const bodyText =
                typeof data === "string"
                    ? data
                    : `Subject: ${data.subject}
                       Status: ${data.status}`;

            if (Notification.permission === "granted") {
                new Notification(" Task Status Update", {
                    body: bodyText,
                    icon: "/Images/Mtech_Logo.jpg",
                });
            }
        };

        client.activate();
        return () => client.deactivate();
    }, []);

    return null;
}

export default NotificationListener;
