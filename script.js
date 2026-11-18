// ==========================================
// SPENDWISE - COMPLETE JAVASCRIPT
// ==========================================

// LocalStorage keys
const ACCOUNTS_KEY = "spendwiseAccounts";
const TRANSACTIONS_KEY = "spendwiseTransactions";
const ACTIVE_ACCOUNT_KEY = "spendwiseActiveAccountId";

// Load saved data
let accounts = JSON.parse(localStorage.getItem(ACCOUNTS_KEY)) || [];
let transactions = JSON.parse(localStorage.getItem(TRANSACTIONS_KEY)) || [];
let activeAccountId = localStorage.getItem(ACTIVE_ACCOUNT_KEY);

let currentTransactionType = "expense";

// ==========================================
// INITIALIZE APP
// ==========================================

function initializeApp() {

    // Create default account if none exists
    if (accounts.length === 0) {
        accounts.push({
            id: "jishan_default",
            name: "Jishan"
        });
    }

    // Make sure active account exists
    let activeAccount = accounts.find(
        account => String(account.id) === String(activeAccountId)
    );

    if (!activeAccount) {
        activeAccountId = accounts[0].id;
    }

    // Assign older transactions without account IDs
    transactions.forEach(transaction => {
        if (!transaction.accountId) {
            transaction.accountId = accounts[0].id;
        }
    });

    saveData();

    updateWelcomeName();
    updateAccountName();
    renderAccounts();
    updateDashboard();
}

// ==========================================
// SAVE DATA
// ==========================================

function saveData() {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
    localStorage.setItem(ACTIVE_ACCOUNT_KEY, activeAccountId);
}

// ==========================================
// GET ACTIVE ACCOUNT
// ==========================================

function getActiveAccount() {
    return accounts.find(
        account => String(account.id) === String(activeAccountId)
    );
}

// ==========================================
// DYNAMIC WELCOME NAME
// ==========================================

function updateWelcomeName() {

    const welcomeTitle = document.getElementById("welcomeTitle");
    const account = getActiveAccount();

    if (welcomeTitle && account) {
        welcomeTitle.textContent =
            `Hello ${account.name}..! 👋`;
    }
}

// ==========================================
// UPDATE PROFILE NAME
// ==========================================

function updateAccountName() {

    const profileBtn = document.getElementById("profileBtn");
    const account = getActiveAccount();

    if (profileBtn && account) {
        profileBtn.textContent = account.name + " 👤";
    }
}

// ==========================================
// CREATE NEW ACCOUNT
// ==========================================

function createAccount() {

    const name = prompt("Enter your account name:");

    if (!name || name.trim() === "") {
        return;
    }

    const newAccount = {
        id: "account_" + Date.now() + "_" +
            Math.random().toString(36).slice(2, 8),
        name: name.trim()
    };

    accounts.push(newAccount);

    activeAccountId = newAccount.id;

    saveData();

    updateWelcomeName();
    updateAccountName();
    renderAccounts();
    updateDashboard();

    document.getElementById("accountMenu").style.display = "none";

    alert("Account created successfully!");
}

// ==========================================
// SWITCH ACCOUNT
// ==========================================

function switchAccount(id) {

    activeAccountId = id;

    saveData();

    // Update greeting and profile name
    updateWelcomeName();
    updateAccountName();

    // Refresh selected account's dashboard
    updateDashboard();

    // Close account menu
    document.getElementById("accountMenu").style.display = "none";
}

// ==========================================
// DELETE ACCOUNT
// ==========================================

function deleteAccount(id) {

    if (accounts.length <= 1) {
        alert("You must keep at least one account.");
        return;
    }

    const account = accounts.find(
        item => String(item.id) === String(id)
    );

    if (!account) return;

    const confirmDelete = confirm(
        `Are you sure you want to delete ${account.name} and all its transactions?`
    );

    if (!confirmDelete) return;

    accounts = accounts.filter(
        item => String(item.id) !== String(id)
    );

    transactions = transactions.filter(
        transaction => String(transaction.accountId) !== String(id)
    );

    // Switch to another account if active account was deleted
    if (String(activeAccountId) === String(id)) {
        activeAccountId = accounts[0].id;
    }

    saveData();

    updateWelcomeName();
    updateAccountName();
    renderAccounts();
    updateDashboard();
}

// ==========================================
// DISPLAY ACCOUNTS
// ==========================================

function renderAccounts() {

    const accountList = document.getElementById("accountList");

    if (!accountList) return;

    accountList.innerHTML = "";

    accounts.forEach(account => {

        const row = document.createElement("div");
        row.className = "account-item";

        const nameButton = document.createElement("button");
        nameButton.type = "button";
        nameButton.textContent =
            account.name +
            (String(account.id) === String(activeAccountId)
                ? " ✓"
                : "");

        nameButton.onclick = () => switchAccount(account.id);

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.textContent = "✕";
        deleteButton.title = "Delete account";
        deleteButton.onclick = () => deleteAccount(account.id);

        row.appendChild(nameButton);
        row.appendChild(deleteButton);

        accountList.appendChild(row);
    });
}

// ==========================================
// UPDATE DASHBOARD
// ==========================================

function updateDashboard() {

    let totalIncome = 0;
    let totalExpense = 0;

    const accountTransactions = transactions.filter(
        transaction =>
            String(transaction.accountId) === String(activeAccountId)
    );

    accountTransactions.forEach(transaction => {

        const amount = Number(transaction.amount) || 0;

        if (transaction.type === "income") {
            totalIncome += amount;
        } else if (transaction.type === "expense") {
            totalExpense += amount;
        }
    });

    const balance = totalIncome - totalExpense;

    document.getElementById("balance").textContent =
        formatMoney(balance);

    document.getElementById("income").textContent =
        formatMoney(totalIncome);

    document.getElementById("expense").textContent =
        formatMoney(totalExpense);

    renderTransactions(accountTransactions);
}

// ==========================================
// MONEY FORMAT
// ==========================================

function formatMoney(amount) {

    return "₹" + Number(amount).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// ==========================================
// ADD INCOME / EXPENSE FORM
// ==========================================

const incomeBtn = document.getElementById("incomeBtn");
const addBtn = document.getElementById("addBtn");
const transactionForm = document.getElementById("transactionForm");
const formTitle = document.getElementById("formTitle");
const saveBtn = document.getElementById("saveBtn");

function openTransactionForm(type) {

    currentTransactionType = type;

    transactionForm.hidden = false;

    formTitle.textContent =
        type === "income" ? "Add Income" : "Add Expense";

    saveBtn.textContent =
        type === "income" ? "Save Income" : "Save Expense";

    transactionForm.reset();

    document.getElementById("dateInput").value =
        new Date().toLocaleDateString("en-CA");
}

incomeBtn.addEventListener("click", () => {
    openTransactionForm("income");
});

addBtn.addEventListener("click", () => {
    openTransactionForm("expense");
});

// ==========================================
// SAVE TRANSACTION
// ==========================================

transactionForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const amount = Number(
        document.getElementById("amountInput").value
    );

    const category =
        document.getElementById("categoryInput").value;

    const date =
        document.getElementById("dateInput").value;

    const description =
        document.getElementById("descriptionInput").value.trim();

    if (!Number.isFinite(amount) || amount <= 0) {
        alert("Please enter a valid amount.");
        return;
    }

    if (!category || !date) {
        alert("Please fill all required fields.");
        return;
    }

    const newTransaction = {

        id: Date.now() + "_" + Math.random().toString(36).slice(2, 7),

        accountId: activeAccountId,

        type: currentTransactionType,

        amount: amount,

        category: category,

        date: date,

        description: description
    };

    transactions.push(newTransaction);

    saveData();

    transactionForm.reset();
    transactionForm.hidden = true;

    updateDashboard();

    alert("Transaction saved successfully!");
});

// ==========================================
// CANCEL FORM
// ==========================================

document.getElementById("cancelBtn").addEventListener("click", () => {

    transactionForm.reset();

    transactionForm.hidden = true;
});

// ==========================================
// DISPLAY RECENT TRANSACTIONS
// ==========================================

function renderTransactions(accountTransactions) {

    const transactionList =
        document.getElementById("transactionList");

    transactionList.innerHTML = "";

    if (accountTransactions.length === 0) {

        const emptyMessage = document.createElement("p");

        emptyMessage.className = "empty";

        emptyMessage.textContent =
            "No transactions yet. Add your first transaction!";

        transactionList.appendChild(emptyMessage);

        return;
    }

    // Latest transactions first
    const sortedTransactions = [...accountTransactions].sort(
        (a, b) => {
            const dateDifference =
                new Date(b.date) - new Date(a.date);

            return dateDifference ||
                String(b.id).localeCompare(String(a.id));
        }
    );

    sortedTransactions.forEach(transaction => {

        const item = document.createElement("div");

        item.className = "transaction-item";

        const details = document.createElement("div");

        details.className = "transaction-details";

        const category = document.createElement("h3");

        category.textContent = transaction.category;

        const description = document.createElement("p");

        description.textContent =
            transaction.description || transaction.category;

        const date = document.createElement("small");

        date.textContent = transaction.date;

        details.appendChild(category);
        details.appendChild(description);
        details.appendChild(date);

        const amount = document.createElement("h3");

        amount.textContent =
            (transaction.type === "income" ? "+" : "-") +
            formatMoney(transaction.amount);

        amount.style.color =
            transaction.type === "income" ? "#16a34a" : "#dc2626";

        const deleteButton = document.createElement("button");

        deleteButton.type = "button";
        deleteButton.textContent = "✕";
        deleteButton.title = "Delete transaction";

        deleteButton.onclick = () => {
            deleteTransaction(transaction.id);
        };

        item.appendChild(details);
        item.appendChild(amount);
        item.appendChild(deleteButton);

        transactionList.appendChild(item);
    });
}

// ==========================================
// DELETE TRANSACTION
// ==========================================

function deleteTransaction(id) {

    const confirmDelete = confirm(
        "Do you want to delete this transaction?"
    );

    if (!confirmDelete) return;

    transactions = transactions.filter(
        transaction => String(transaction.id) !== String(id)
    );

    saveData();

    updateDashboard();
}

// ==========================================
// RESET CURRENT ACCOUNT
// ==========================================

document.getElementById("resetBtn").addEventListener("click", () => {

    const confirmReset = confirm(
        "Are you sure you want to reset all transactions of this account?"
    );

    if (!confirmReset) return;

    transactions = transactions.filter(
        transaction =>
            String(transaction.accountId) !== String(activeAccountId)
    );

    saveData();

    updateDashboard();

    alert("Current account transactions have been reset!");
});

// ==========================================
// ACCOUNT MENU
// ==========================================

const profileBtn = document.getElementById("profileBtn");
const accountMenu = document.getElementById("accountMenu");

profileBtn.addEventListener("click", () => {

    accountMenu.style.display =
        accountMenu.style.display === "block"
            ? "none"
            : "block";
});

// Close menu when clicking outside
document.addEventListener("click", function(event) {

    if (
        !profileBtn.contains(event.target) &&
        !accountMenu.contains(event.target)
    ) {
        accountMenu.style.display = "none";
    }
});

// ==========================================
// START APPLICATION
// ==========================================

initializeApp();

// Make account functions available to HTML
window.createAccount = createAccount;
window.switchAccount = switchAccount;
window.deleteAccount = deleteAccount;