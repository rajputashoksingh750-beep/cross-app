import React, { useState, useRef } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Dimensions, ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Camera, CameraType, CameraRecordingOptions } from 'expo-camera';
import { COLORS, SPACING, RADIUS, TAGS, GROUP_SIZES, WHO_CAN_JOIN } from '../constants/theme';
import { saveInviteToFirestore, uploadVideoToStorage } from '../utils/firebaseService';
import { MOCK_USER_PROFILE } from '../utils/mockData';

const { width } = Dimensions.get('window');

export default function CreateScreen() {
    const [step, setStep] = useState(0); // 0=perm, 1=record, 2=tags, 3=settings
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [recording, setRecording] = useState(false);
    const [videoUri, setVideoUri] = useState<string | null>(null);

    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [groupSize, setGroupSize] = useState(2);
    const [whoCanJoin, setWhoCanJoin] = useState('Anyone');

    const [timer, setTimer] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const cameraRef = useRef<any>(null);
    const timerInterval = useRef<any>(null);

    const requestCameraPermission = async () => {
        const { status } = await Camera.requestCameraPermissionsAsync();
        const audioStatus = await Camera.requestMicrophonePermissionsAsync();
        setHasPermission(status === 'granted' && audioStatus.status === 'granted');
        if (status === 'granted' && audioStatus.status === 'granted') {
            setStep(1);
        } else {
            Alert.alert('Permission Denied', 'Camera and mic access are required to post an invite.');
        }
    };

    const toggleTag = (tag: string) => {
        setSelectedTags(prev =>
            prev.includes(tag) ? prev.filter(t => t !== tag) : prev.length < 3 ? [...prev, tag] : prev
        );
    };

    const startRecording = async () => {
        if (!cameraRef.current) return;
        setRecording(true);
        setTimer(0);

        // Start max 40s timer
        timerInterval.current = setInterval(() => {
            setTimer(prev => {
                if (prev >= 39) {
                    stopRecording(); // Auto stop at 40s
                    return 40;
                }
                return prev + 1;
            });
        }, 1000);

        try {
            const options: CameraRecordingOptions = {
                maxDuration: 40,
                quality: '480p', // Keep file size small for fast uploads on Firebase free tier
            };
            const data = await cameraRef.current.recordAsync(options);
            setVideoUri(data.uri);
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to record video');
            stopRecording();
        }
    };

    const stopRecording = () => {
        if (!cameraRef.current) return;
        setRecording(false);
        clearInterval(timerInterval.current);
        cameraRef.current.stopRecording();
    };

    const handlePost = async () => {
        if (!videoUri) return;

        setIsUploading(true);
        try {
            // 1. Upload video to Firebase Storage
            const videoUrl = await uploadVideoToStorage(videoUri, (progress) => {
                setUploadProgress(progress);
            });

            // 2. Save data to Firestore Database
            const now = Date.now();
            const expiresAt = now + (2 * 60 * 60 * 1000); // Expires in 2 hours

            await saveInviteToFirestore({
                userId: 'temp_user_123',
                userName: MOCK_USER_PROFILE.name,
                userAvatar: MOCK_USER_PROFILE.avatar,
                location: 'Surat Central',
                city: 'Surat',
                tags: selectedTags,
                whoCanJoin,
                groupSize,
                joinedCount: 0,
                createdAt: now,
                expiresAt: expiresAt,
                videoUrl: videoUrl
            });

            Alert.alert('🎉 Invite Posted!', 'Your invite is now live in Surat!\nIt will auto-delete in 2 hours.', [
                { text: 'Awesome!', onPress: resetForm }
            ]);
        } catch (error) {
            Alert.alert('Upload Failed', 'There was an issue posting your invite.');
            console.error(error);
        } finally {
            setIsUploading(false);
        }
    };

    const resetForm = () => {
        setStep(1);
        setVideoUri(null);
        setRecording(false);
        setTimer(0);
        setSelectedTags([]);
        setUploadProgress(0);
    };

    return (
        <View style={s.container}>
            <View style={s.header}>
                <Text style={s.title}>Create Invite</Text>
                <Text style={s.subtitle}>3 invites left today</Text>
            </View>

            {/* Step Indicator */}
            {step > 0 && (
                <View style={s.steps}>
                    {['Record', 'Tags', 'Settings'].map((label, i) => {
                        const stepIndex = i + 1;
                        return (
                            <View key={i} style={s.stepItem}>
                                <View style={[s.stepDot, step >= stepIndex && s.stepDotActive]}>
                                    <Text style={[s.stepNum, step >= stepIndex && s.stepNumActive]}>{i + 1}</Text>
                                </View>
                                <Text style={[s.stepLabel, step >= stepIndex && s.stepLabelActive]}>{label}</Text>
                                {i < 2 && <View style={[s.stepLine, step > stepIndex && s.stepLineActive]} />}
                            </View>
                        );
                    })}
                </View>
            )}

            {step === 0 && (
                <View style={s.permSection}>
                    <Ionicons name="camera" size={64} color={COLORS.primary} />
                    <Text style={s.permTitle}>Camera Access</Text>
                    <Text style={s.permDesc}>We need access to your camera and microphone to record live video invites.</Text>
                    <TouchableOpacity style={s.permBtn} onPress={requestCameraPermission}>
                        <Text style={s.permBtnText}>Allow Access</Text>
                    </TouchableOpacity>
                </View>
            )}

            {step === 1 && (
                <View style={s.recordSection}>
                    <View style={s.cameraBox}>
                        {!videoUri ? (
                            <Camera
                                ref={cameraRef}
                                style={s.cameraPreview}
                                type={CameraType.front}
                            >
                                {recording && (
                                    <View style={s.recordingOverlay}>
                                        <View style={s.recIndicator} />
                                        <Text style={s.timerText}>{`0:${timer.toString().padStart(2, '0')}`}</Text>
                                    </View>
                                )}
                            </Camera>
                        ) : (
                            <LinearGradient colors={[COLORS.bgCard, COLORS.surface]} style={s.cameraPreview}>
                                <Ionicons name="checkmark-circle" size={56} color={COLORS.success} />
                                <Text style={s.recordedText}>Video Recorded!</Text>
                                <TouchableOpacity style={s.retakeBtn} onPress={() => setVideoUri(null)}>
                                    <Ionicons name="refresh" size={16} color={COLORS.accent} />
                                    <Text style={s.retakeText}>Retake</Text>
                                </TouchableOpacity>
                            </LinearGradient>
                        )}
                    </View>

                    {!videoUri ? (
                        <>
                            <TouchableOpacity
                                style={s.recButton}
                                onPress={recording ? stopRecording : startRecording}
                                activeOpacity={0.7}
                            >
                                <View style={[s.recOuter, recording && s.recOuterActive]}>
                                    <View style={[s.recInner, recording && s.recInnerSquare]} />
                                </View>
                            </TouchableOpacity>
                            <Text style={s.recHint}>{recording ? 'Tap to stop (max 40s)' : 'Tap to start recording'}</Text>
                        </>
                    ) : (
                        <TouchableOpacity style={s.nextBtn} onPress={() => setStep(2)} activeOpacity={0.7}>
                            <LinearGradient colors={[COLORS.primary, COLORS.accent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.nextGradient}>
                                <Text style={s.nextText}>Next Step</Text>
                                <Ionicons name="arrow-forward" size={18} color="#FFF" />
                            </LinearGradient>
                        </TouchableOpacity>
                    )}
                </View>
            )}

            {step === 2 && (
                <ScrollView style={s.tagsSection} showsVerticalScrollIndicator={false}>
                    <Text style={s.sectionTitle}>Add Tags (up to 3)</Text>
                    <View style={s.tagsGrid}>
                        {TAGS.map(tag => (
                            <TouchableOpacity key={tag} style={[s.tagChip, selectedTags.includes(tag) && s.tagChipActive]}
                                onPress={() => toggleTag(tag)} activeOpacity={0.7}>
                                <Text style={[s.tagChipText, selectedTags.includes(tag) && s.tagChipTextActive]}>{tag}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <TouchableOpacity style={s.nextBtn} onPress={() => setStep(3)} activeOpacity={0.7}>
                        <LinearGradient colors={[COLORS.primary, COLORS.accent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.nextGradient}>
                            <Text style={s.nextText}>Next</Text>
                            <Ionicons name="arrow-forward" size={18} color="#FFF" />
                        </LinearGradient>
                    </TouchableOpacity>
                </ScrollView>
            )}

            {step === 3 && (
                <ScrollView style={s.settingsSection} contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
                    <Text style={s.sectionTitle}>Who can join?</Text>
                    <View style={s.optionRow}>
                        {WHO_CAN_JOIN.map(w => (
                            <TouchableOpacity key={w} style={[s.optionBtn, whoCanJoin === w && s.optionBtnActive]}
                                onPress={() => setWhoCanJoin(w)} activeOpacity={0.7}>
                                <Text style={s.optionIcon}>{w === 'Anyone' ? '👥' : w === 'Only Girls' ? '👩' : '👦'}</Text>
                                <Text style={[s.optionText, whoCanJoin === w && s.optionTextActive]}>{w}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={s.sectionTitle}>Group Size</Text>
                    <View style={s.sizeRow}>
                        {GROUP_SIZES.map(n => (
                            <TouchableOpacity key={n} style={[s.sizeBtn, groupSize === n && s.sizeBtnActive]}
                                onPress={() => setGroupSize(n)} activeOpacity={0.7}>
                                <Text style={[s.sizeText, groupSize === n && s.sizeTextActive]}>{n}</Text>
                                <Text style={s.sizeLabel}>{n === 1 ? 'person' : 'people'}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={s.summaryBox}>
                        <Text style={s.summaryTitle}>📋 Summary</Text>
                        <Text style={s.summaryItem}>Tags: {selectedTags.length > 0 ? selectedTags.join(', ') : 'None'}</Text>
                        <Text style={s.summaryItem}>Who: {whoCanJoin}</Text>
                        <Text style={s.summaryItem}>Group: {groupSize} {groupSize === 1 ? 'person' : 'people'}</Text>
                        <Text style={s.summaryItem}>Expires: 2 hours</Text>
                    </View>

                    <TouchableOpacity style={s.postBtn} onPress={handlePost} disabled={isUploading} activeOpacity={0.7}>
                        <LinearGradient colors={[COLORS.primary, COLORS.accent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.postGradient}>
                            {isUploading ? (
                                <>
                                    <ActivityIndicator color="#FFF" />
                                    <Text style={s.postText}>Uploading {Math.round(uploadProgress)}%</Text>
                                </>
                            ) : (
                                <>
                                    <Ionicons name="rocket" size={20} color="#FFF" />
                                    <Text style={s.postText}>Post Invite</Text>
                                </>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </ScrollView>
            )}

            {step > 1 && !isUploading && (
                <TouchableOpacity style={s.backBtn} onPress={() => setStep(step - 1)}>
                    <Ionicons name="arrow-back" size={20} color={COLORS.textPrimary} />
                </TouchableOpacity>
            )}
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bgDark },
    header: { paddingHorizontal: SPACING.lg, paddingTop: 52, paddingBottom: SPACING.sm },
    title: { fontSize: 26, fontWeight: '800', color: COLORS.textPrimary },
    subtitle: { fontSize: 13, color: COLORS.textMuted, marginTop: 2 },
    steps: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md },
    stepItem: { flexDirection: 'row', alignItems: 'center' },
    stepDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: COLORS.border },
    stepDotActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    stepNum: { fontSize: 12, fontWeight: '700', color: COLORS.textMuted },
    stepNumActive: { color: '#FFF' },
    stepLabel: { fontSize: 11, color: COLORS.textMuted, fontWeight: '500', marginLeft: 4, marginRight: 4 },
    stepLabelActive: { color: COLORS.primary },
    stepLine: { width: 24, height: 2, backgroundColor: COLORS.border, marginHorizontal: 2 },
    stepLineActive: { backgroundColor: COLORS.primary },
    permSection: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: SPACING.xl },
    permTitle: { fontSize: 22, fontWeight: '700', color: COLORS.textPrimary, marginTop: SPACING.lg },
    permDesc: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', marginTop: SPACING.sm, marginBottom: SPACING.xl },
    permBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 999 },
    permBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
    recordSection: { flex: 1, alignItems: 'center', paddingHorizontal: SPACING.md },
    cameraBox: { width: '100%', height: 400, borderRadius: RADIUS.lg, overflow: 'hidden', marginBottom: SPACING.lg, backgroundColor: COLORS.surface },
    cameraPreview: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    recordingOverlay: { position: 'absolute', top: 20, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999, gap: 8 },
    recIndicator: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.danger },
    timerText: { fontSize: 16, color: '#FFF', fontWeight: '700', fontVariant: ['tabular-nums'] },
    recordedText: { fontSize: 18, color: COLORS.success, fontWeight: '700', marginTop: 16 },
    retakeBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 16, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999, backgroundColor: 'rgba(255,101,132,0.12)' },
    retakeText: { fontSize: 13, color: COLORS.accent, fontWeight: '600' },
    recButton: { marginBottom: SPACING.sm },
    recOuter: { width: 76, height: 76, borderRadius: 38, borderWidth: 4, borderColor: COLORS.accent, justifyContent: 'center', alignItems: 'center' },
    recOuterActive: { borderColor: COLORS.danger },
    recInner: { width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.accent },
    recInnerSquare: { borderRadius: 8, backgroundColor: COLORS.danger, width: 28, height: 28 },
    recHint: { fontSize: 14, color: COLORS.textMuted, fontWeight: '500' },
    nextBtn: { marginTop: SPACING.md, borderRadius: 999, overflow: 'hidden', alignSelf: 'center' },
    nextGradient: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 36, paddingVertical: 14, gap: 10 },
    nextText: { fontSize: 16, fontWeight: '700', color: '#FFF' },
    tagsSection: { flex: 1, paddingHorizontal: SPACING.md },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, marginBottom: SPACING.md, marginTop: SPACING.sm },
    tagsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    tagChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999, backgroundColor: COLORS.bgCard, borderWidth: 1, borderColor: COLORS.border },
    tagChipActive: { backgroundColor: 'rgba(108,99,255,0.2)', borderColor: COLORS.primary },
    tagChipText: { fontSize: 14, color: COLORS.textSecondary, fontWeight: '500' },
    tagChipTextActive: { color: COLORS.primary },
    settingsSection: { flex: 1, paddingHorizontal: SPACING.md },
    optionRow: { flexDirection: 'row', gap: 8, marginBottom: SPACING.lg },
    optionBtn: { flex: 1, alignItems: 'center', paddingVertical: 14, borderRadius: RADIUS.md, backgroundColor: COLORS.bgCard, borderWidth: 1, borderColor: COLORS.border, gap: 4 },
    optionBtnActive: { borderColor: COLORS.primary, backgroundColor: 'rgba(108,99,255,0.15)' },
    optionIcon: { fontSize: 22 },
    optionText: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '600' },
    optionTextActive: { color: COLORS.primary },
    sizeRow: { flexDirection: 'row', gap: 8, marginBottom: SPACING.lg },
    sizeBtn: { flex: 1, alignItems: 'center', paddingVertical: 14, borderRadius: RADIUS.md, backgroundColor: COLORS.bgCard, borderWidth: 1, borderColor: COLORS.border },
    sizeBtnActive: { borderColor: COLORS.primary, backgroundColor: 'rgba(108,99,255,0.15)' },
    sizeText: { fontSize: 20, fontWeight: '800', color: COLORS.textSecondary },
    sizeTextActive: { color: COLORS.primary },
    sizeLabel: { fontSize: 10, color: COLORS.textMuted, marginTop: 2 },
    summaryBox: { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.md, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.lg },
    summaryTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 8 },
    summaryItem: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 22 },
    postBtn: { borderRadius: 999, overflow: 'hidden', alignSelf: 'center', marginBottom: SPACING.xl },
    postGradient: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 40, paddingVertical: 16, gap: 10 },
    postText: { fontSize: 18, fontWeight: '800', color: '#FFF' },
    backBtn: { position: 'absolute', top: 52, right: SPACING.lg, width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center' },
});
