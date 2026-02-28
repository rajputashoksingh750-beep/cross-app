import React, { useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { MOCK_USER_PROFILE } from '../utils/mockData';

export default function ProfileScreen() {
    const [verifying, setVerifying] = useState(false);
    const p = MOCK_USER_PROFILE;

    const startVerification = () => {
        setVerifying(true);
        setTimeout(() => {
            setVerifying(false);
            Alert.alert('✅ Verified!', 'Your face has been verified. You are now a Verified Human on CROSS.');
        }, 2500);
    };

    return (
        <ScrollView style={s.container} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={s.header}>
                <Text style={s.title}>Profile</Text>
                <TouchableOpacity style={s.settingsBtn}>
                    <Ionicons name="settings-outline" size={22} color={COLORS.textPrimary} />
                </TouchableOpacity>
            </View>

            {/* Profile Card */}
            <LinearGradient colors={[COLORS.bgCard, COLORS.surface]} style={s.profileCard}>
                <View style={s.avatarBig}>
                    <Text style={{ fontSize: 48 }}>{p.avatar}</Text>
                </View>
                <Text style={s.name}>{p.name}</Text>
                <View style={s.cityRow}>
                    <Ionicons name="location" size={14} color={COLORS.accent} />
                    <Text style={s.city}>{p.city}</Text>
                </View>
                {p.verified ? (
                    <View style={s.verifiedBadge}>
                        <Ionicons name="shield-checkmark" size={16} color={COLORS.primary} />
                        <Text style={s.verifiedText}>Verified Human</Text>
                    </View>
                ) : (
                    <TouchableOpacity style={s.verifyBtn} onPress={startVerification} disabled={verifying} activeOpacity={0.7}>
                        <Text style={s.verifyBtnText}>{verifying ? 'Scanning Face...' : 'Verify Now'}</Text>
                    </TouchableOpacity>
                )}
            </LinearGradient>

            {/* AI Face Verification */}
            <View style={s.section}>
                <Text style={s.sectionTitle}>🔐 AI Face Verification</Text>
                <View style={s.verifyCard}>
                    <View style={s.verifyStep}>
                        <View style={[s.verifyDot, s.verifyDotDone]}><Ionicons name="checkmark" size={14} color="#FFF" /></View>
                        <View style={{ flex: 1 }}>
                            <Text style={s.verifyStepTitle}>Live Face Scan</Text>
                            <Text style={s.verifyStepDesc}>Record a short live face video</Text>
                        </View>
                    </View>
                    <View style={s.verifyStep}>
                        <View style={[s.verifyDot, s.verifyDotDone]}><Ionicons name="checkmark" size={14} color="#FFF" /></View>
                        <View style={{ flex: 1 }}>
                            <Text style={s.verifyStepTitle}>Liveness Detection</Text>
                            <Text style={s.verifyStepDesc}>AI confirms you&apos;re a real human</Text>
                        </View>
                    </View>
                    <View style={s.verifyStep}>
                        <View style={[s.verifyDot, s.verifyDotDone]}><Ionicons name="checkmark" size={14} color="#FFF" /></View>
                        <View style={{ flex: 1 }}>
                            <Text style={s.verifyStepTitle}>Photo Match</Text>
                            <Text style={s.verifyStepDesc}>Profile photo matches verified face</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Stats */}
            <View style={s.statsRow}>
                <View style={s.statBox}>
                    <Text style={s.statNum}>{p.totalInvites}</Text>
                    <Text style={s.statLabel}>Invites</Text>
                </View>
                <View style={s.statBox}>
                    <Text style={s.statNum}>{p.totalJoins}</Text>
                    <Text style={s.statLabel}>Joins</Text>
                </View>
                <View style={s.statBox}>
                    <Text style={s.statNum}>{p.pastInvites.length}</Text>
                    <Text style={s.statLabel}>This Week</Text>
                </View>
            </View>

            {/* Past Invites */}
            <View style={s.section}>
                <Text style={s.sectionTitle}>Recent Invites</Text>
                {p.pastInvites.map(inv => (
                    <View key={inv.id} style={s.historyCard}>
                        <View style={s.historyIcon}>
                            <Ionicons name="videocam" size={18} color={COLORS.primary} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={s.historyTitle}>{inv.description}</Text>
                            <Text style={s.historyMeta}>{inv.date} • {inv.joined} joined</Text>
                        </View>
                    </View>
                ))}
            </View>

            {/* Safety Features */}
            <View style={s.section}>
                <Text style={s.sectionTitle}>🛡️ Safety & Trust</Text>
                <View style={s.safetyGrid}>
                    {[
                        { icon: 'time', label: 'Auto-expire videos', desc: '2h limit' },
                        { icon: 'flag', label: 'Report users', desc: 'Fast review' },
                        { icon: 'eye-off', label: 'AI moderation', desc: 'Active 24/7' },
                        { icon: 'layers', label: 'Daily limit', desc: '3 invites/day' },
                    ].map((item, i) => (
                        <View key={i} style={s.safetyItem}>
                            <Ionicons name={item.icon as any} size={20} color={COLORS.success} />
                            <Text style={s.safetyLabel}>{item.label}</Text>
                            <Text style={s.safetyDesc}>{item.desc}</Text>
                        </View>
                    ))}
                </View>
            </View>

            <View style={{ height: 100 }} />
        </ScrollView>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bgDark },
    content: { paddingHorizontal: SPACING.md },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.sm, paddingTop: 52, paddingBottom: SPACING.sm },
    title: { fontSize: 26, fontWeight: '800', color: COLORS.textPrimary },
    settingsBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center' },
    profileCard: { borderRadius: RADIUS.lg, padding: SPACING.lg, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.md },
    avatarBig: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.sm },
    name: { fontSize: 22, fontWeight: '800', color: COLORS.textPrimary },
    cityRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
    city: { fontSize: 14, color: COLORS.textSecondary, fontWeight: '500' },
    verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: SPACING.sm, backgroundColor: 'rgba(108,99,255,0.15)', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 999 },
    verifiedText: { fontSize: 13, color: COLORS.primary, fontWeight: '700' },
    verifyBtn: { marginTop: SPACING.sm, backgroundColor: COLORS.accent, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 999 },
    verifyBtnText: { fontSize: 14, color: '#FFF', fontWeight: '700' },
    section: { marginTop: SPACING.md },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, marginBottom: SPACING.sm },
    verifyCard: { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.md, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.border, gap: 12 },
    verifyStep: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    verifyDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center' },
    verifyDotDone: { backgroundColor: COLORS.success },
    verifyStepTitle: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
    verifyStepDesc: { fontSize: 12, color: COLORS.textMuted },
    statsRow: { flexDirection: 'row', gap: 8, marginTop: SPACING.md },
    statBox: { flex: 1, backgroundColor: COLORS.bgCard, borderRadius: RADIUS.md, padding: SPACING.md, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
    statNum: { fontSize: 24, fontWeight: '800', color: COLORS.primary },
    statLabel: { fontSize: 12, color: COLORS.textMuted, fontWeight: '500' },
    historyCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bgCard, padding: SPACING.md, borderRadius: RADIUS.md, marginBottom: SPACING.sm, borderWidth: 1, borderColor: COLORS.border },
    historyIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(108,99,255,0.15)', justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md },
    historyTitle: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
    historyMeta: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
    safetyGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    safetyItem: { width: '48%', backgroundColor: COLORS.bgCard, borderRadius: RADIUS.md, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.border, gap: 4 },
    safetyLabel: { fontSize: 13, fontWeight: '600', color: COLORS.textPrimary },
    safetyDesc: { fontSize: 11, color: COLORS.textMuted },
});
