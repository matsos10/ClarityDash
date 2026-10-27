-- CreateEnum
CREATE TYPE "Theme" AS ENUM ('SYSTEM', 'LIGHT', 'DARK');

-- CreateEnum
CREATE TYPE "SpaceKind" AS ENUM ('PERSONAL', 'COUPLE', 'FAMILY');

-- CreateEnum
CREATE TYPE "SpaceRole" AS ENUM ('OWNER', 'MEMBER');

-- CreateEnum
CREATE TYPE "Module" AS ENUM ('HORIZONS', 'ROUTINE', 'TRADING', 'BUSINESS', 'FINANCE', 'HOME', 'FAMILY', 'ADMIN', 'PERSONAL');

-- CreateEnum
CREATE TYPE "Domain" AS ENUM ('BUSINESS', 'TRADING', 'HOME', 'FAMILY', 'PERSONAL');

-- CreateEnum
CREATE TYPE "ObjectiveArea" AS ENUM ('AUTONOMOUS_INCOME', 'DREAM_PROPERTY', 'NET_WORTH', 'HEALTH', 'SOCIAL_IMPACT');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('ACTIVE', 'WAITING', 'BLOCKED', 'DONE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ProjectKind" AS ENUM ('GENERIC', 'CONSTRUCTION', 'RENOVATION', 'SOLAR', 'LITIGATION', 'BOOK', 'ASSOCIATION');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('INBOX', 'BACKLOG', 'WEEK', 'TODAY', 'DONE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CaptureSource" AS ENUM ('APP', 'VOICE', 'SHARE', 'TELEGRAM');

-- CreateEnum
CREATE TYPE "CaptureStatus" AS ENUM ('PENDING', 'SUGGESTED', 'ROUTED', 'DISMISSED');

-- CreateEnum
CREATE TYPE "PropFirm" AS ENUM ('TOPSTEP', 'FUNDEDNEXT', 'PERSONAL', 'OTHER');

-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('EVALUATION', 'FUNDED', 'LIVE', 'PERSONAL');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'BREACHED', 'PASSED', 'CLOSED');

-- CreateEnum
CREATE TYPE "DrawdownType" AS ENUM ('TRAILING_EOD', 'TRAILING_INTRADAY', 'STATIC');

-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('PLANNED', 'REQUESTED', 'PAID', 'REJECTED');

-- CreateEnum
CREATE TYPE "Instrument" AS ENUM ('XAUUSD', 'MGC', 'GC', 'OTHER');

-- CreateEnum
CREATE TYPE "Direction" AS ENUM ('LONG', 'SHORT');

-- CreateEnum
CREATE TYPE "Emotion" AS ENUM ('CALM', 'CONFIDENT', 'FOMO', 'FEAR', 'REVENGE', 'BORED', 'TIRED', 'EUPHORIC');

-- CreateEnum
CREATE TYPE "Bias" AS ENUM ('BULLISH', 'BEARISH', 'NEUTRAL');

-- CreateEnum
CREATE TYPE "LeadStage" AS ENUM ('NEW', 'CONTACTED', 'MEETING', 'AUDIT', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('CALL', 'EMAIL', 'WHATSAPP', 'VISIT', 'MEETING', 'NOTE');

-- CreateEnum
CREATE TYPE "AssetKind" AS ENUM ('PROPERTY', 'BANK', 'TRADING', 'INVESTMENT', 'VEHICLE', 'CASH', 'OTHER');

-- CreateEnum
CREATE TYPE "LiabilityKind" AS ENUM ('MORTGAGE', 'LOAN', 'CREDIT_CARD', 'OTHER');

-- CreateEnum
CREATE TYPE "JarCode" AS ENUM ('NEC', 'FFA', 'LTSS', 'EDU', 'PLAY', 'GIVE');

-- CreateEnum
CREATE TYPE "TransactionKind" AS ENUM ('INCOME', 'EXPENSE', 'TRANSFER');

-- CreateEnum
CREATE TYPE "PropertyKind" AS ENUM ('HOME', 'RENTAL', 'LAND');

-- CreateEnum
CREATE TYPE "TaxKind" AS ENUM ('IRS', 'IVA', 'IRC', 'IUC', 'IMI', 'SEGURANCA_SOCIAL', 'IMT', 'OTHER');

-- CreateEnum
CREATE TYPE "TaxEntity" AS ENUM ('PERSONAL', 'COMPANY');

-- CreateEnum
CREATE TYPE "PhaseStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'DONE', 'BLOCKED');

-- CreateEnum
CREATE TYPE "QuoteStatus" AS ENUM ('REQUESTED', 'RECEIVED', 'ACCEPTED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "DossierKind" AS ENUM ('PERMIT', 'LITIGATION', 'ADMIN');

-- CreateEnum
CREATE TYPE "DossierEventKind" AS ENUM ('LETTER_SENT', 'LETTER_RECEIVED', 'SUBMISSION', 'DECISION', 'HEARING', 'DEADLINE', 'NOTE');

-- CreateEnum
CREATE TYPE "MemberRole" AS ENUM ('PARTNER', 'CHILD');

-- CreateEnum
CREATE TYPE "SchoolEventKind" AS ENUM ('TEST', 'MEETING', 'HOMEWORK', 'PROJECT', 'HOLIDAY', 'OTHER');

-- CreateEnum
CREATE TYPE "ApplicationStage" AS ENUM ('TARGET', 'APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'ACCEPTED', 'REJECTED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "VehicleEventKind" AS ENUM ('SERVICE', 'IPO', 'INSURANCE', 'IUC', 'TYRES', 'REPAIR');

-- CreateEnum
CREATE TYPE "WorkoutKind" AS ENUM ('WALK', 'TENNIS', 'GOLF', 'RUN', 'GYM', 'OTHER');

-- CreateEnum
CREATE TYPE "CropEventKind" AS ENUM ('SOW', 'TRANSPLANT', 'WATER', 'FERTILIZE', 'HARVEST');

-- CreateEnum
CREATE TYPE "AgentKind" AS ENUM ('CHIEF', 'TRADING', 'BUSINESS', 'FINANCE', 'HOME', 'FAMILY');

-- CreateEnum
CREATE TYPE "MessageRole" AS ENUM ('USER', 'ASSISTANT', 'TOOL');

-- CreateEnum
CREATE TYPE "AiActionKind" AS ENUM ('SEND_EMAIL', 'CREATE_EVENT', 'CREATE_TASK', 'UPDATE_RECORD');

-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'EXECUTED', 'FAILED');

-- CreateEnum
CREATE TYPE "AlertKind" AS ENUM ('OVERLOAD', 'STALE_OBJECTIVE', 'ORPHAN_TASK', 'DOCUMENT_EXPIRY', 'FOLLOW_UP', 'PAYOUT_WINDOW', 'MLL_PROXIMITY', 'TAX_DUE', 'OTHER');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "locale" TEXT NOT NULL DEFAULT 'fr',
    "timezone" TEXT NOT NULL DEFAULT 'Europe/Lisbon',
    "theme" "Theme" NOT NULL DEFAULT 'SYSTEM',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Space" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kind" "SpaceKind" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Space_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpaceMember" (
    "spaceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "SpaceRole" NOT NULL DEFAULT 'MEMBER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SpaceMember_pkey" PRIMARY KEY ("spaceId","userId")
);

-- CreateTable
CREATE TABLE "SpaceModule" (
    "spaceId" TEXT NOT NULL,
    "module" "Module" NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "SpaceModule_pkey" PRIMARY KEY ("spaceId","module")
);

-- CreateTable
CREATE TABLE "Vision" (
    "id" TEXT NOT NULL,
    "spaceId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "textFr" TEXT NOT NULL,
    "textPt" TEXT,
    "targetDate" DATE NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Objective" (
    "id" TEXT NOT NULL,
    "spaceId" TEXT NOT NULL,
    "visionId" TEXT,
    "area" "ObjectiveArea" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "lastActionAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Objective_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Milestone" (
    "id" TEXT NOT NULL,
    "visionId" TEXT NOT NULL,
    "objectiveId" TEXT,
    "title" TEXT NOT NULL,
    "dueDate" DATE NOT NULL,
    "doneAt" TIMESTAMP(3),
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Milestone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KeyResult" (
    "id" TEXT NOT NULL,
    "objectiveId" TEXT NOT NULL,
    "ownerId" TEXT,
    "quarter" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "unit" TEXT,
    "startValue" DECIMAL(14,2) NOT NULL,
    "targetValue" DECIMAL(14,2) NOT NULL,
    "currentValue" DECIMAL(14,2) NOT NULL,
    "score" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KeyResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KeyResultCheckin" (
    "id" TEXT NOT NULL,
    "keyResultId" TEXT NOT NULL,
    "weekStart" DATE NOT NULL,
    "value" DECIMAL(14,2) NOT NULL,
    "score" DECIMAL(3,2) NOT NULL,
    "note" TEXT,

    CONSTRAINT "KeyResultCheckin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuarterlyReview" (
    "id" TEXT NOT NULL,
    "spaceId" TEXT NOT NULL,
    "quarter" TEXT NOT NULL,
    "wentWell" TEXT,
    "wentBadly" TEXT,
    "lessons" TEXT,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "QuarterlyReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "spaceId" TEXT NOT NULL,
    "objectiveId" TEXT,
    "keyResultId" TEXT,
    "brandId" TEXT,
    "kind" "ProjectKind" NOT NULL DEFAULT 'GENERIC',
    "domain" "Domain" NOT NULL,
    "status" "ProjectStatus" NOT NULL DEFAULT 'ACTIVE',
    "title" TEXT NOT NULL,
    "description" TEXT,
    "nextActionTaskId" TEXT,
    "blockedReason" TEXT,
    "specs" JSONB,
    "startDate" DATE,
    "dueDate" DATE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "spaceId" TEXT NOT NULL,
    "projectId" TEXT,
    "keyResultId" TEXT,
    "objectiveId" TEXT,
    "assigneeId" TEXT,
    "captureId" TEXT,
    "phaseId" TEXT,
    "title" TEXT NOT NULL,
    "notes" TEXT,
    "domain" "Domain" NOT NULL,
    "status" "TaskStatus" NOT NULL DEFAULT 'BACKLOG',
    "todayRank" INTEGER,
    "plannedDate" DATE,
    "weekStart" DATE,
    "dueDate" DATE,
    "estimateMin" INTEGER,
    "timeboxStart" TIMESTAMP(3),
    "timeboxEnd" TIMESTAMP(3),
    "calendarEventId" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeeklyOutcome" (
    "id" TEXT NOT NULL,
    "spaceId" TEXT NOT NULL,
    "weekStart" DATE NOT NULL,
    "rank" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "keyResultId" TEXT,
    "done" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "WeeklyOutcome_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeeklyReview" (
    "id" TEXT NOT NULL,
    "spaceId" TEXT NOT NULL,
    "weekStart" DATE NOT NULL,
    "routineRate" DECIMAL(5,2),
    "tradingPnl" DECIMAL(14,2),
    "projectsNote" TEXT,
    "wins" TEXT,
    "lessons" TEXT,
    "familyMoment" TEXT,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "WeeklyReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JournalEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "done" TEXT,
    "blocked" TEXT,
    "tomorrow" TEXT,
    "mood" INTEGER,
    "energy" INTEGER,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JournalEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyBrief" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "content" JSONB NOT NULL,
    "sentAt" TIMESTAMP(3),

    CONSTRAINT "DailyBrief_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoutineItem" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "objectiveId" TEXT,
    "title" TEXT NOT NULL,
    "domain" "Domain" NOT NULL,
    "daysOfWeek" INTEGER[],
    "timeOfDay" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "RoutineItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoutineCheck" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "done" BOOLEAN NOT NULL DEFAULT true,
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RoutineCheck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Capture" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "source" "CaptureSource" NOT NULL,
    "rawText" TEXT NOT NULL,
    "audioUrl" TEXT,
    "transcript" TEXT,
    "suggestedModule" "Module",
    "suggestion" JSONB,
    "status" "CaptureStatus" NOT NULL DEFAULT 'PENDING',
    "routedType" TEXT,
    "routedId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "Capture_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TradingAccount" (
    "id" TEXT NOT NULL,
    "spaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "firm" "PropFirm" NOT NULL,
    "type" "AccountType" NOT NULL,
    "status" "AccountStatus" NOT NULL DEFAULT 'ACTIVE',
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "startingBalance" DECIMAL(14,2) NOT NULL,
    "balance" DECIMAL(14,2) NOT NULL,
    "highWaterMark" DECIMAL(14,2) NOT NULL,
    "maxLossLimit" DECIMAL(14,2),
    "drawdownType" "DrawdownType" NOT NULL DEFAULT 'TRAILING_EOD',
    "mllLockBalance" DECIMAL(14,2),
    "dailyLossLimit" DECIMAL(14,2),
    "consistencyPct" INTEGER,
    "payoutMinDays" INTEGER,
    "payoutMinDayProfit" DECIMAL(14,2),
    "profitSplitPct" INTEGER,
    "isPersonalFund" BOOLEAN NOT NULL DEFAULT false,
    "openedAt" DATE NOT NULL,
    "closedAt" DATE,

    CONSTRAINT "TradingAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payout" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "status" "PayoutStatus" NOT NULL DEFAULT 'PLANNED',
    "requestedAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "note" TEXT,

    CONSTRAINT "Payout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PreSessionChecklistItem" (
    "id" TEXT NOT NULL,
    "spaceId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "required" BOOLEAN NOT NULL DEFAULT true,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "PreSessionChecklistItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TradingSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "macroAnalysisId" TEXT,
    "checklist" JSONB NOT NULL,
    "checklistPassedAt" TIMESTAMP(3),
    "lossesCount" INTEGER NOT NULL DEFAULT 0,
    "lockedAt" TIMESTAMP(3),
    "lockReason" TEXT,

    CONSTRAINT "TradingSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TradeSetup" (
    "id" TEXT NOT NULL,
    "spaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "TradeSetup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trade" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "sessionId" TEXT,
    "setupId" TEXT,
    "copyGroupId" TEXT,
    "instrument" "Instrument" NOT NULL,
    "direction" "Direction" NOT NULL,
    "entryAt" TIMESTAMP(3) NOT NULL,
    "exitAt" TIMESTAMP(3),
    "entryPrice" DECIMAL(12,3) NOT NULL,
    "exitPrice" DECIMAL(12,3),
    "stopPrice" DECIMAL(12,3),
    "targetPrice" DECIMAL(12,3),
    "quantity" DECIMAL(10,2) NOT NULL,
    "pnl" DECIMAL(14,2) NOT NULL,
    "fees" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "riskAmount" DECIMAL(14,2),
    "rMultiple" DECIMAL(6,2),
    "emotion" "Emotion",
    "emotionNote" TEXT,
    "followedPlan" BOOLEAN,
    "screenshotUrl" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Trade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MacroAnalysis" (
    "id" TEXT NOT NULL,
    "spaceId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "instrument" "Instrument" NOT NULL DEFAULT 'XAUUSD',
    "newsImpact" JSONB NOT NULL,
    "score" INTEGER NOT NULL,
    "bias" "Bias" NOT NULL,
    "levels" JSONB NOT NULL,
    "causalChain" TEXT NOT NULL,
    "mainCatalyst" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MacroAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MacroScenario" (
    "id" TEXT NOT NULL,
    "analysisId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "probability" INTEGER NOT NULL,
    "trigger" TEXT NOT NULL,
    "target" TEXT,
    "invalidation" TEXT,

    CONSTRAINT "MacroScenario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScalingTier" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "capitalMin" DECIMAL(14,2) NOT NULL,
    "lotSize" DECIMAL(6,2) NOT NULL,
    "maxRiskPct" DECIMAL(5,2),
    "reachedAt" TIMESTAMP(3),

    CONSTRAINT "ScalingTier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Brand" (
    "id" TEXT NOT NULL,
    "spaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT,

    CONSTRAINT "Brand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "contactName" TEXT,
    "role" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "city" TEXT,
    "source" TEXT,
    "stage" "LeadStage" NOT NULL DEFAULT 'NEW',
    "valueEur" DECIMAL(12,2),
    "nextAction" TEXT,
    "nextFollowUpAt" TIMESTAMP(3),
    "lostReason" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeadActivity" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "type" "ActivityType" NOT NULL,
    "at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "summary" TEXT NOT NULL,

    CONSTRAINT "LeadActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageTemplate" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "channel" "ActivityType" NOT NULL DEFAULT 'EMAIL',
    "language" TEXT NOT NULL DEFAULT 'pt-PT',
    "subject" TEXT,
    "body" TEXT NOT NULL,

    CONSTRAINT "MessageTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Asset" (
    "id" TEXT NOT NULL,
    "spaceId" TEXT NOT NULL,
    "kind" "AssetKind" NOT NULL,
    "name" TEXT NOT NULL,
    "propertyId" TEXT,
    "tradingAccountId" TEXT,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssetValuation" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "month" DATE NOT NULL,
    "value" DECIMAL(14,2) NOT NULL,

    CONSTRAINT "AssetValuation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Liability" (
    "id" TEXT NOT NULL,
    "spaceId" TEXT NOT NULL,
    "propertyId" TEXT,
    "kind" "LiabilityKind" NOT NULL,
    "name" TEXT NOT NULL,
    "lender" TEXT,
    "principal" DECIMAL(14,2) NOT NULL,
    "rateAnnualPct" DECIMAL(6,3) NOT NULL,
    "monthlyPayment" DECIMAL(12,2) NOT NULL,
    "startDate" DATE NOT NULL,
    "termMonths" INTEGER NOT NULL,

    CONSTRAINT "Liability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LiabilityBalance" (
    "id" TEXT NOT NULL,
    "liabilityId" TEXT NOT NULL,
    "month" DATE NOT NULL,
    "balance" DECIMAL(14,2) NOT NULL,

    CONSTRAINT "LiabilityBalance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NetWorthSnapshot" (
    "id" TEXT NOT NULL,
    "spaceId" TEXT NOT NULL,
    "month" DATE NOT NULL,
    "totalAssets" DECIMAL(14,2) NOT NULL,
    "totalLiabilities" DECIMAL(14,2) NOT NULL,
    "netWorth" DECIMAL(14,2) NOT NULL,

    CONSTRAINT "NetWorthSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Jar" (
    "id" TEXT NOT NULL,
    "spaceId" TEXT NOT NULL,
    "code" "JarCode" NOT NULL,
    "pct" DECIMAL(5,2) NOT NULL,

    CONSTRAINT "Jar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "spaceId" TEXT NOT NULL,
    "jarId" TEXT,
    "date" DATE NOT NULL,
    "kind" "TransactionKind" NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "label" TEXT NOT NULL,
    "category" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Property" (
    "id" TEXT NOT NULL,
    "spaceId" TEXT NOT NULL,
    "kind" "PropertyKind" NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "municipality" TEXT,
    "areaM2" DECIMAL(8,2),
    "purchasePrice" DECIMAL(14,2),
    "purchaseDate" DATE,

    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lease" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "tenantName" TEXT NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE,
    "baseRent" DECIMAL(10,2) NOT NULL,
    "currentRent" DECIMAL(10,2) NOT NULL,
    "indexationMonth" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Lease_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RentIndexation" (
    "id" TEXT NOT NULL,
    "leaseId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "coefficient" DECIMAL(7,5) NOT NULL,
    "previousRent" DECIMAL(10,2) NOT NULL,
    "newRent" DECIMAL(10,2) NOT NULL,
    "effectiveDate" DATE NOT NULL,
    "letterSentAt" TIMESTAMP(3),

    CONSTRAINT "RentIndexation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RentPayment" (
    "id" TEXT NOT NULL,
    "leaseId" TEXT NOT NULL,
    "month" DATE NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "paidAt" TIMESTAMP(3),

    CONSTRAINT "RentPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxObligation" (
    "id" TEXT NOT NULL,
    "spaceId" TEXT NOT NULL,
    "kind" "TaxKind" NOT NULL,
    "entity" "TaxEntity" NOT NULL,
    "label" TEXT NOT NULL,
    "period" TEXT,
    "dueDate" DATE NOT NULL,
    "amount" DECIMAL(12,2),
    "recurrence" TEXT,
    "paidAt" TIMESTAMP(3),

    CONSTRAINT "TaxObligation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EbfChecklistItem" (
    "id" TEXT NOT NULL,
    "spaceId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "article" TEXT,
    "label" TEXT NOT NULL,
    "done" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,

    CONSTRAINT "EbfChecklistItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectPhase" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "status" "PhaseStatus" NOT NULL DEFAULT 'TODO',
    "startDate" DATE,
    "endDate" DATE,
    "budget" DECIMAL(12,2),

    CONSTRAINT "ProjectPhase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Material" (
    "id" TEXT NOT NULL,
    "phaseId" TEXT NOT NULL,
    "supplierId" TEXT,
    "name" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "qtyNet" DECIMAL(10,2) NOT NULL,
    "wastePct" DECIMAL(5,2) NOT NULL DEFAULT 10,
    "unitPrice" DECIMAL(10,2),
    "purchasedAt" TIMESTAMP(3),

    CONSTRAINT "Material_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Supplier" (
    "id" TEXT NOT NULL,
    "spaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "trade" TEXT,
    "contactName" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "nif" TEXT,

    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quote" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "amountExVat" DECIMAL(12,2) NOT NULL,
    "vatRatePct" DECIMAL(5,2) NOT NULL DEFAULT 23,
    "status" "QuoteStatus" NOT NULL DEFAULT 'REQUESTED',
    "receivedAt" TIMESTAMP(3),
    "validUntil" DATE,
    "scope" JSONB,
    "fileUrl" TEXT,

    CONSTRAINT "Quote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupplierFollowUp" (
    "id" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "projectId" TEXT,
    "dueAt" TIMESTAMP(3) NOT NULL,
    "doneAt" TIMESTAMP(3),
    "note" TEXT,

    CONSTRAINT "SupplierFollowUp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dossier" (
    "id" TEXT NOT NULL,
    "spaceId" TEXT NOT NULL,
    "projectId" TEXT,
    "kind" "DossierKind" NOT NULL,
    "title" TEXT NOT NULL,
    "reference" TEXT,
    "authority" TEXT,
    "status" TEXT,

    CONSTRAINT "Dossier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DossierEvent" (
    "id" TEXT NOT NULL,
    "dossierId" TEXT NOT NULL,
    "kind" "DossierEventKind" NOT NULL,
    "date" DATE NOT NULL,
    "dueAt" DATE,
    "title" TEXT NOT NULL,
    "notes" TEXT,
    "fileUrl" TEXT,

    CONSTRAINT "DossierEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FamilyMember" (
    "id" TEXT NOT NULL,
    "spaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "MemberRole" NOT NULL,
    "birthDate" DATE,
    "school" TEXT,
    "grade" TEXT,
    "teacher" TEXT,

    CONSTRAINT "FamilyMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SchoolEvent" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "kind" "SchoolEventKind" NOT NULL,
    "subject" TEXT,
    "title" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "result" TEXT,
    "notes" TEXT,

    CONSTRAINT "SchoolEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RevisionSession" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "plannedAt" TIMESTAMP(3) NOT NULL,
    "doneAt" TIMESTAMP(3),
    "durationMin" INTEGER,
    "notes" TEXT,

    CONSTRAINT "RevisionSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PortugueseExercise" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "level" TEXT,
    "content" JSONB NOT NULL,
    "answers" JSONB,
    "score" DECIMAL(5,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PortugueseExercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecurringError" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "example" TEXT NOT NULL,
    "correction" TEXT,
    "count" INTEGER NOT NULL DEFAULT 1,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecurringError_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobApplication" (
    "id" TEXT NOT NULL,
    "spaceId" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "location" TEXT,
    "salaryRange" TEXT,
    "url" TEXT,
    "stage" "ApplicationStage" NOT NULL DEFAULT 'TARGET',
    "appliedAt" DATE,
    "nextStep" TEXT,
    "nextStepAt" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "JobApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Interview" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "at" TIMESTAMP(3) NOT NULL,
    "kind" TEXT,
    "interviewer" TEXT,
    "notes" TEXT,
    "outcome" TEXT,

    CONSTRAINT "Interview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OutingIdea" (
    "id" TEXT NOT NULL,
    "spaceId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "location" TEXT,
    "costEur" DECIMAL(8,2),
    "season" TEXT,
    "doneAt" TIMESTAMP(3),
    "rating" INTEGER,

    CONSTRAINT "OutingIdea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vehicle" (
    "id" TEXT NOT NULL,
    "spaceId" TEXT NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "plate" TEXT,
    "odometerKm" INTEGER,

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehicleEvent" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "kind" "VehicleEventKind" NOT NULL,
    "date" DATE NOT NULL,
    "km" INTEGER,
    "cost" DECIMAL(10,2),
    "nextDueDate" DATE,
    "nextDueKm" INTEGER,
    "notes" TEXT,

    CONSTRAINT "VehicleEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "spaceId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "kind" TEXT,
    "holderName" TEXT,
    "number" TEXT,
    "expiresAt" DATE,
    "alertDaysBefore" INTEGER NOT NULL DEFAULT 30,
    "fileUrl" TEXT,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Book" (
    "id" TEXT NOT NULL,
    "spaceId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "targetWords" INTEGER,
    "targetPages" INTEGER,
    "deadline" DATE,

    CONSTRAINT "Book_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chapter" (
    "id" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "wordCount" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',

    CONSTRAINT "Chapter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WritingSession" (
    "id" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "words" INTEGER NOT NULL,
    "minutes" INTEGER,

    CONSTRAINT "WritingSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Workout" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "kind" "WorkoutKind" NOT NULL,
    "durationMin" INTEGER NOT NULL,
    "distanceKm" DECIMAL(6,2),
    "notes" TEXT,

    CONSTRAINT "Workout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Crop" (
    "id" TEXT NOT NULL,
    "spaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "variety" TEXT,
    "plot" TEXT,

    CONSTRAINT "Crop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CropEvent" (
    "id" TEXT NOT NULL,
    "cropId" TEXT NOT NULL,
    "kind" "CropEventKind" NOT NULL,
    "plannedAt" DATE NOT NULL,
    "doneAt" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "CropEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiConversation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiConversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiMessage" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "role" "MessageRole" NOT NULL,
    "agent" "AgentKind" NOT NULL DEFAULT 'CHIEF',
    "content" TEXT NOT NULL,
    "inputTokens" INTEGER,
    "outputTokens" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiAction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "conversationId" TEXT,
    "kind" "AiActionKind" NOT NULL,
    "payload" JSONB NOT NULL,
    "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "approvedAt" TIMESTAMP(3),
    "executedAt" TIMESTAMP(3),
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Alert" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" "AlertKind" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "entityType" TEXT,
    "entityId" TEXT,
    "dueAt" TIMESTAMP(3),
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PushSubscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PushSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TelegramLink" (
    "userId" TEXT NOT NULL,
    "chatId" BIGINT NOT NULL,
    "linkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TelegramLink_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "SyncMutation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SyncMutation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE INDEX "KeyResult_quarter_idx" ON "KeyResult"("quarter");

-- CreateIndex
CREATE UNIQUE INDEX "KeyResultCheckin_keyResultId_weekStart_key" ON "KeyResultCheckin"("keyResultId", "weekStart");

-- CreateIndex
CREATE UNIQUE INDEX "QuarterlyReview_spaceId_quarter_key" ON "QuarterlyReview"("spaceId", "quarter");

-- CreateIndex
CREATE UNIQUE INDEX "Project_nextActionTaskId_key" ON "Project"("nextActionTaskId");

-- CreateIndex
CREATE INDEX "Project_spaceId_status_idx" ON "Project"("spaceId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Task_captureId_key" ON "Task"("captureId");

-- CreateIndex
CREATE INDEX "Task_spaceId_status_idx" ON "Task"("spaceId", "status");

-- CreateIndex
CREATE INDEX "Task_spaceId_plannedDate_idx" ON "Task"("spaceId", "plannedDate");

-- CreateIndex
CREATE INDEX "Task_spaceId_weekStart_idx" ON "Task"("spaceId", "weekStart");

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyOutcome_spaceId_weekStart_rank_key" ON "WeeklyOutcome"("spaceId", "weekStart", "rank");

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyReview_spaceId_weekStart_key" ON "WeeklyReview"("spaceId", "weekStart");

-- CreateIndex
CREATE UNIQUE INDEX "JournalEntry_userId_date_key" ON "JournalEntry"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "DailyBrief_userId_date_key" ON "DailyBrief"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "RoutineCheck_itemId_date_key" ON "RoutineCheck"("itemId", "date");

-- CreateIndex
CREATE INDEX "Capture_userId_status_idx" ON "Capture"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "TradingSession_userId_date_key" ON "TradingSession"("userId", "date");

-- CreateIndex
CREATE INDEX "Trade_accountId_entryAt_idx" ON "Trade"("accountId", "entryAt");

-- CreateIndex
CREATE INDEX "Trade_copyGroupId_idx" ON "Trade"("copyGroupId");

-- CreateIndex
CREATE UNIQUE INDEX "MacroAnalysis_spaceId_date_instrument_key" ON "MacroAnalysis"("spaceId", "date", "instrument");

-- CreateIndex
CREATE INDEX "Lead_brandId_stage_idx" ON "Lead"("brandId", "stage");

-- CreateIndex
CREATE INDEX "Lead_nextFollowUpAt_idx" ON "Lead"("nextFollowUpAt");

-- CreateIndex
CREATE UNIQUE INDEX "Asset_propertyId_key" ON "Asset"("propertyId");

-- CreateIndex
CREATE UNIQUE INDEX "Asset_tradingAccountId_key" ON "Asset"("tradingAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "AssetValuation_assetId_month_key" ON "AssetValuation"("assetId", "month");

-- CreateIndex
CREATE UNIQUE INDEX "LiabilityBalance_liabilityId_month_key" ON "LiabilityBalance"("liabilityId", "month");

-- CreateIndex
CREATE UNIQUE INDEX "NetWorthSnapshot_spaceId_month_key" ON "NetWorthSnapshot"("spaceId", "month");

-- CreateIndex
CREATE UNIQUE INDEX "Jar_spaceId_code_key" ON "Jar"("spaceId", "code");

-- CreateIndex
CREATE INDEX "Transaction_spaceId_date_idx" ON "Transaction"("spaceId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "RentIndexation_leaseId_year_key" ON "RentIndexation"("leaseId", "year");

-- CreateIndex
CREATE UNIQUE INDEX "RentPayment_leaseId_month_key" ON "RentPayment"("leaseId", "month");

-- CreateIndex
CREATE INDEX "TaxObligation_spaceId_dueDate_idx" ON "TaxObligation"("spaceId", "dueDate");

-- CreateIndex
CREATE INDEX "Document_expiresAt_idx" ON "Document"("expiresAt");

-- CreateIndex
CREATE INDEX "Alert_userId_readAt_idx" ON "Alert"("userId", "readAt");

-- CreateIndex
CREATE UNIQUE INDEX "PushSubscription_endpoint_key" ON "PushSubscription"("endpoint");

-- CreateIndex
CREATE UNIQUE INDEX "TelegramLink_chatId_key" ON "TelegramLink"("chatId");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpaceMember" ADD CONSTRAINT "SpaceMember_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "Space"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpaceMember" ADD CONSTRAINT "SpaceMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpaceModule" ADD CONSTRAINT "SpaceModule_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "Space"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vision" ADD CONSTRAINT "Vision_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "Space"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Objective" ADD CONSTRAINT "Objective_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "Space"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Objective" ADD CONSTRAINT "Objective_visionId_fkey" FOREIGN KEY ("visionId") REFERENCES "Vision"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Milestone" ADD CONSTRAINT "Milestone_visionId_fkey" FOREIGN KEY ("visionId") REFERENCES "Vision"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Milestone" ADD CONSTRAINT "Milestone_objectiveId_fkey" FOREIGN KEY ("objectiveId") REFERENCES "Objective"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KeyResult" ADD CONSTRAINT "KeyResult_objectiveId_fkey" FOREIGN KEY ("objectiveId") REFERENCES "Objective"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KeyResult" ADD CONSTRAINT "KeyResult_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KeyResultCheckin" ADD CONSTRAINT "KeyResultCheckin_keyResultId_fkey" FOREIGN KEY ("keyResultId") REFERENCES "KeyResult"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuarterlyReview" ADD CONSTRAINT "QuarterlyReview_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "Space"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "Space"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_objectiveId_fkey" FOREIGN KEY ("objectiveId") REFERENCES "Objective"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_keyResultId_fkey" FOREIGN KEY ("keyResultId") REFERENCES "KeyResult"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_nextActionTaskId_fkey" FOREIGN KEY ("nextActionTaskId") REFERENCES "Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "Space"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_keyResultId_fkey" FOREIGN KEY ("keyResultId") REFERENCES "KeyResult"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_objectiveId_fkey" FOREIGN KEY ("objectiveId") REFERENCES "Objective"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_captureId_fkey" FOREIGN KEY ("captureId") REFERENCES "Capture"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES "ProjectPhase"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeeklyOutcome" ADD CONSTRAINT "WeeklyOutcome_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "Space"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeeklyOutcome" ADD CONSTRAINT "WeeklyOutcome_keyResultId_fkey" FOREIGN KEY ("keyResultId") REFERENCES "KeyResult"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeeklyReview" ADD CONSTRAINT "WeeklyReview_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "Space"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalEntry" ADD CONSTRAINT "JournalEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyBrief" ADD CONSTRAINT "DailyBrief_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoutineItem" ADD CONSTRAINT "RoutineItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoutineItem" ADD CONSTRAINT "RoutineItem_objectiveId_fkey" FOREIGN KEY ("objectiveId") REFERENCES "Objective"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoutineCheck" ADD CONSTRAINT "RoutineCheck_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "RoutineItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Capture" ADD CONSTRAINT "Capture_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TradingAccount" ADD CONSTRAINT "TradingAccount_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "Space"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payout" ADD CONSTRAINT "Payout_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "TradingAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreSessionChecklistItem" ADD CONSTRAINT "PreSessionChecklistItem_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "Space"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TradingSession" ADD CONSTRAINT "TradingSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TradingSession" ADD CONSTRAINT "TradingSession_macroAnalysisId_fkey" FOREIGN KEY ("macroAnalysisId") REFERENCES "MacroAnalysis"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TradeSetup" ADD CONSTRAINT "TradeSetup_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "Space"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "TradingAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "TradingSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_setupId_fkey" FOREIGN KEY ("setupId") REFERENCES "TradeSetup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MacroAnalysis" ADD CONSTRAINT "MacroAnalysis_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "Space"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MacroScenario" ADD CONSTRAINT "MacroScenario_analysisId_fkey" FOREIGN KEY ("analysisId") REFERENCES "MacroAnalysis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScalingTier" ADD CONSTRAINT "ScalingTier_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "TradingAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Brand" ADD CONSTRAINT "Brand_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "Space"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadActivity" ADD CONSTRAINT "LeadActivity_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageTemplate" ADD CONSTRAINT "MessageTemplate_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "Space"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_tradingAccountId_fkey" FOREIGN KEY ("tradingAccountId") REFERENCES "TradingAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetValuation" ADD CONSTRAINT "AssetValuation_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Liability" ADD CONSTRAINT "Liability_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "Space"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Liability" ADD CONSTRAINT "Liability_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LiabilityBalance" ADD CONSTRAINT "LiabilityBalance_liabilityId_fkey" FOREIGN KEY ("liabilityId") REFERENCES "Liability"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NetWorthSnapshot" ADD CONSTRAINT "NetWorthSnapshot_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "Space"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Jar" ADD CONSTRAINT "Jar_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "Space"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "Space"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_jarId_fkey" FOREIGN KEY ("jarId") REFERENCES "Jar"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "Space"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lease" ADD CONSTRAINT "Lease_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentIndexation" ADD CONSTRAINT "RentIndexation_leaseId_fkey" FOREIGN KEY ("leaseId") REFERENCES "Lease"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentPayment" ADD CONSTRAINT "RentPayment_leaseId_fkey" FOREIGN KEY ("leaseId") REFERENCES "Lease"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxObligation" ADD CONSTRAINT "TaxObligation_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "Space"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EbfChecklistItem" ADD CONSTRAINT "EbfChecklistItem_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "Space"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectPhase" ADD CONSTRAINT "ProjectPhase_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Material" ADD CONSTRAINT "Material_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES "ProjectPhase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Material" ADD CONSTRAINT "Material_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Supplier" ADD CONSTRAINT "Supplier_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "Space"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierFollowUp" ADD CONSTRAINT "SupplierFollowUp_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierFollowUp" ADD CONSTRAINT "SupplierFollowUp_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dossier" ADD CONSTRAINT "Dossier_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "Space"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dossier" ADD CONSTRAINT "Dossier_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DossierEvent" ADD CONSTRAINT "DossierEvent_dossierId_fkey" FOREIGN KEY ("dossierId") REFERENCES "Dossier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FamilyMember" ADD CONSTRAINT "FamilyMember_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "Space"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolEvent" ADD CONSTRAINT "SchoolEvent_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "FamilyMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RevisionSession" ADD CONSTRAINT "RevisionSession_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "FamilyMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortugueseExercise" ADD CONSTRAINT "PortugueseExercise_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "FamilyMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecurringError" ADD CONSTRAINT "RecurringError_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "FamilyMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobApplication" ADD CONSTRAINT "JobApplication_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "Space"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interview" ADD CONSTRAINT "Interview_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "JobApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutingIdea" ADD CONSTRAINT "OutingIdea_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "Space"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "Space"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleEvent" ADD CONSTRAINT "VehicleEvent_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "Space"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Book" ADD CONSTRAINT "Book_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "Space"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chapter" ADD CONSTRAINT "Chapter_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WritingSession" ADD CONSTRAINT "WritingSession_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Workout" ADD CONSTRAINT "Workout_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Crop" ADD CONSTRAINT "Crop_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "Space"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropEvent" ADD CONSTRAINT "CropEvent_cropId_fkey" FOREIGN KEY ("cropId") REFERENCES "Crop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiConversation" ADD CONSTRAINT "AiConversation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiMessage" ADD CONSTRAINT "AiMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "AiConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiAction" ADD CONSTRAINT "AiAction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiAction" ADD CONSTRAINT "AiAction_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "AiConversation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PushSubscription" ADD CONSTRAINT "PushSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TelegramLink" ADD CONSTRAINT "TelegramLink_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SyncMutation" ADD CONSTRAINT "SyncMutation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

