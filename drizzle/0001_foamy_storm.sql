CREATE TABLE `connections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`requesterId` int NOT NULL,
	`receiverId` int NOT NULL,
	`status` enum('pending','accepted','rejected') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `connections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `conversationMembers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversationId` int NOT NULL,
	`userId` int NOT NULL,
	CONSTRAINT `conversationMembers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `conversations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(160),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `conversations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `expenses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tripId` int NOT NULL,
	`paidBy` int NOT NULL,
	`amount` int NOT NULL,
	`description` varchar(200) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `expenses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `guideBookings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`travelerId` int NOT NULL,
	`guideId` int NOT NULL,
	`destination` varchar(160) NOT NULL,
	`date` varchar(32) NOT NULL,
	`price` int NOT NULL,
	`status` enum('pending','accepted','rejected','confirmed') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `guideBookings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `guides` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(160) NOT NULL,
	`location` varchar(160) NOT NULL,
	`languages` text NOT NULL,
	`experience` int NOT NULL DEFAULT 1,
	`rating` int NOT NULL DEFAULT 48,
	`price` int NOT NULL DEFAULT 80,
	`verified` boolean NOT NULL DEFAULT true,
	`imageUrl` text,
	CONSTRAINT `guides_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversationId` int NOT NULL,
	`senderId` int NOT NULL,
	`message` text NOT NULL,
	`readAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` varchar(80) NOT NULL,
	`title` varchar(160) NOT NULL,
	`message` text NOT NULL,
	`read` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `safetyChecks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tripId` int NOT NULL,
	`userId` int NOT NULL,
	`currentLocation` varchar(255),
	`lastCheckin` timestamp,
	`status` enum('ready','active','needs_checkin') NOT NULL DEFAULT 'ready',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `safetyChecks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `travelJournals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`tripId` int,
	`title` varchar(200) NOT NULL,
	`content` text NOT NULL,
	`photos` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `travelJournals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `trips` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`destination` varchar(160) NOT NULL,
	`startDate` varchar(32) NOT NULL,
	`endDate` varchar(32) NOT NULL,
	`budget` int NOT NULL DEFAULT 0,
	`description` text,
	`status` enum('upcoming','active','completed') NOT NULL DEFAULT 'upcoming',
	`itinerary` json,
	`plannedRoute` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `trips_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `mobile` varchar(32);--> statement-breakpoint
ALTER TABLE `users` ADD `city` varchar(120);--> statement-breakpoint
ALTER TABLE `users` ADD `country` varchar(120);--> statement-breakpoint
ALTER TABLE `users` ADD `profilePhoto` text;--> statement-breakpoint
ALTER TABLE `users` ADD `bio` text;--> statement-breakpoint
ALTER TABLE `users` ADD `interests` text;--> statement-breakpoint
ALTER TABLE `users` ADD `onboardingCompleted` boolean DEFAULT false NOT NULL;