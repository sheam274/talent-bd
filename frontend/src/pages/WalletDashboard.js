function WalletDashboard({ user, setView }) {
    const [withdrawMode, setWithdrawMode] = useState(false);
    const [payoutMethod, setPayoutMethod] = useState('bKash');
    
    const nextLevelXP = 1000;
    const progress = ((user?.points || 0) % nextLevelXP) / 10;

    const handleWithdrawRequest = () => {
        if (user.walletBalance < 10) {
            alert("Minimum withdrawal limit is $10. Keep learning to earn more!");
        } else {
            alert(`Payout request of $${user.walletBalance} sent to your ${payoutMethod} account. Processing takes 24 hours.`);
            setWithdrawMode(false);
        }
    };

    return (
        <div style={dashStyles.container}>
            <header style={dashStyles.header}>
                <h2 style={{margin: 0}}>Earnings & Rewards Hub</h2>
                <p style={{color: '#64748b'}}>Your total income from verified skill milestones.</p>
            </header>

            <div style={dashStyles.statsGrid}>
                {/* BALANCE CARD */}
                <motion.div whileHover={{y: -5}} style={{...dashStyles.card, background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)', color: '#fff'}}>
                    <div style={{...dashStyles.cardLabel, color: '#94a3b8'}}>Wallet Balance</div>
                    <div style={{...dashStyles.balance, color: '#10b981'}}>${user?.walletBalance || 0}.00</div>
                    <button 
                        onClick={() => setWithdrawMode(true)}
                        style={{...styles.primaryBtn, background: '#10b981', marginTop: '15px', width: 'auto', padding: '8px 20px'}}
                    >
                        Withdraw Money
                    </button>
                </motion.div>

                {/* LEVEL CARD */}
                <motion.div whileHover={{y: -5}} style={dashStyles.card}>
                    <div style={dashStyles.cardLabel}>Rank & Progress</div>
                    <div style={dashStyles.levelText}>Lvl {Math.floor((user?.points || 0) / 1000) + 1} Specialist</div>
                    <div style={dashStyles.progressTrack}>
                        <div style={{...dashStyles.progressBar, width: `${progress}%`}}></div>
                    </div>
                    <div style={dashStyles.cardFooter}>{user?.points || 0} Total XP • Verified Skill Earned</div>
                </motion.div>
            </div>

            {/* WITHDRAWAL FORM (Conditional) */}
            {withdrawMode && (
                <motion.div initial={{opacity: 0, scale: 0.9}} animate={{opacity: 1, scale: 1}} style={{...dashStyles.card, border: '2px solid #10b981', marginBottom: '30px'}}>
                    <h3>Cash Out to Mobile Wallet</h3>
                    <div style={{display: 'flex', gap: '15px', marginBottom: '15px'}}>
                        <select 
                            style={formStyles.input} 
                            value={payoutMethod} 
                            onChange={(e) => setPayoutMethod(e.target.value)}
                        >
                            <option value="bKash">bKash</option>
                            <option value="Nagad">Nagad</option>
                            <option value="Upay">Upay</option>
                        </select>
                        <input style={formStyles.input} placeholder="Enter Wallet Number (01XXX...)" type="number" />
                    </div>
                    <div style={{display: 'flex', gap: '10px'}}>
                        <button onClick={handleWithdrawRequest} style={{...styles.primaryBtn, flex: 1}}>Confirm Payout</button>
                        <button onClick={() => setWithdrawMode(false)} style={{...styles.adminBtn, flex: 1}}>Cancel</button>
                    </div>
                </motion.div>
            )}

            {/* EARNING LOGS */}
            <div style={dashStyles.card}>
                <h3 style={{marginTop: 0, borderBottom: '1px solid #f1f5f9', paddingBottom: '10px'}}>Earning History</h3>
                {user?.skills?.length > 0 ? (
                    user.skills.map((skill, i) => (
                        <div key={i} style={{display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f8fafc'}}>
                            <div>
                                <div style={{fontWeight: 'bold'}}>Verification Bonus: {skill}</div>
                                <div style={{fontSize: '12px', color: '#94a3b8'}}>Platform Reward for Completion</div>
                            </div>
                            <div style={{color: '#10b981', fontWeight: 'bold'}}>+$50.00</div>
                        </div>
                    ))
                ) : (
                    <div style={{textAlign: 'center', padding: '20px', color: '#94a3b8'}}>
                        No transactions found. Complete a course to earn your first $50!
                    </div>
                )}
            </div>
            
            <button onClick={() => setView('learning')} style={{...styles.primaryBtn, background: '#6366f1', marginTop: '20px'}}>
                Go to Learning Hub to Earn More
            </button>
        </div>
    );
}