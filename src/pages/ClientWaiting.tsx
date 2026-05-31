import { motion } from 'framer-motion';
import { Clock, ShieldCheck, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const ClientWaiting = () => {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full bg-card border border-border rounded-xl p-8 text-center shadow-card"
            >
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Clock className="text-accent h-8 w-8" />
                </div>

                <h1 className="text-2xl font-bold font-display text-foreground mb-4">
                    Registration Received
                </h1>

                <p className="text-muted-foreground mb-8">
                    Thank you for registering your business with Qbits. We will be in touch shortly to complete your onboarding.
                </p>

                <div className="space-y-4 mb-8 text-left">
                    <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                        <ShieldCheck className="text-accent h-5 w-5 mt-0.5" />
                        <div>
                            <p className="font-semibold text-foreground text-sm">Next Steps</p>
                            <p className="text-sm text-muted-foreground">Our team will call you shortly to gather more information.</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                        <Clock className="text-accent h-5 w-5 mt-0.5" />
                        <div>
                            <p className="font-semibold text-foreground text-sm">Service Explanation</p>
                            <p className="text-sm text-muted-foreground">We will explain our services and how we can help you grow.</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                        <Mail className="text-accent h-5 w-5 mt-0.5" />
                        <div>
                            <p className="font-semibold text-foreground text-sm">Final Step</p>
                            <p className="text-sm text-muted-foreground">We will send payment link to your email. And your account will be activated immediately.</p>
                        </div>
                    </div>
                </div>

            </motion.div>
        </div>
    );
};

export default ClientWaiting;
