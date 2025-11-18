/**
 * Private Identity Management with Arcium
 * Allows users to prove identity attributes without revealing them
 */

import { ArciumClient } from '../client';
import { PublicKey } from '@solana/web3.js';
import nacl from 'tweetnacl';
import { encodeBase64 } from 'tweetnacl-util';
import { sha256 } from '@noble/hashes/sha256';

export interface IdentityAttribute {
  type: 'age' | 'location' | 'credit_score' | 'charging_history' | 'carbon_offset';
  value: any;
  encrypted: boolean;
}

export interface IdentityProof {
  attribute: string;
  claim: string; // e.g., "age > 18", "location in USA"
  proof: string;
  verified: boolean;
  timestamp: number;
}

export class PrivateIdentity {
  private client: ArciumClient;
  private attributes: Map<string, IdentityAttribute>;

  constructor(client: ArciumClient) {
    this.client = client;
    this.attributes = new Map();
  }

  /**
   * Add encrypted identity attribute
   */
  async addAttribute(
    type: IdentityAttribute['type'],
    value: any
  ): Promise<void> {
    const encrypted = await this.client.encryptForMXE({ type, value });

    this.attributes.set(type, {
      type,
      value: encrypted,
      encrypted: true,
    });

    console.log(`🔐 Added encrypted ${type} attribute`);
  }

  /**
   * Prove age without revealing exact age
   */
  async proveAgeOver(minAge: number, wallet: PublicKey): Promise<IdentityProof> {
    const ageAttr = this.attributes.get('age');
    if (!ageAttr) {
      throw new Error('Age attribute not set');
    }

    // Generate ZK proof: age >= minAge
    const proof = await this.client.generateZKProof(
      { age: ageAttr.value }, // Private
      { minAge, wallet: wallet.toString() }, // Public
      'age_verification'
    );

    const verified = await this.client.verifyZKProofOnChain(proof, wallet);

    return {
      attribute: 'age',
      claim: `age >= ${minAge}`,
      proof: proof.proof,
      verified,
      timestamp: Date.now(),
    };
  }

  /**
   * Prove location in region without revealing exact location
   */
  async proveLocationInRegion(
    region: string,
    wallet: PublicKey
  ): Promise<IdentityProof> {
    const locationAttr = this.attributes.get('location');
    if (!locationAttr) {
      throw new Error('Location attribute not set');
    }

    const proof = await this.client.generateZKProof(
      { location: locationAttr.value },
      { region, wallet: wallet.toString() },
      'location_verification'
    );

    const verified = await this.client.verifyZKProofOnChain(proof, wallet);

    return {
      attribute: 'location',
      claim: `location in ${region}`,
      proof: proof.proof,
      verified,
      timestamp: Date.now(),
    };
  }

  /**
   * Prove charging history threshold without revealing exact history
   */
  async proveChargingHistory(
    minSessions: number,
    wallet: PublicKey
  ): Promise<IdentityProof> {
    const historyAttr = this.attributes.get('charging_history');
    if (!historyAttr) {
      throw new Error('Charging history attribute not set');
    }

    const proof = await this.client.generateZKProof(
      { sessions: historyAttr.value },
      { minSessions, wallet: wallet.toString() },
      'history_verification'
    );

    const verified = await this.client.verifyZKProofOnChain(proof, wallet);

    return {
      attribute: 'charging_history',
      claim: `sessions >= ${minSessions}`,
      proof: proof.proof,
      verified,
      timestamp: Date.now(),
    };
  }

  /**
   * Prove carbon offset without revealing exact amount
   */
  async proveCarbonOffset(
    minOffset: number,
    wallet: PublicKey
  ): Promise<IdentityProof> {
    const carbonAttr = this.attributes.get('carbon_offset');
    if (!carbonAttr) {
      throw new Error('Carbon offset attribute not set');
    }

    const proof = await this.client.generateZKProof(
      { offset: carbonAttr.value },
      { minOffset, wallet: wallet.toString() },
      'carbon_verification'
    );

    const verified = await this.client.verifyZKProofOnChain(proof, wallet);

    return {
      attribute: 'carbon_offset',
      claim: `offset >= ${minOffset} kg CO2`,
      proof: proof.proof,
      verified,
      timestamp: Date.now(),
    };
  }

  /**
   * Create anonymous credential
   */
  async createAnonymousCredential(
    credentialType: string,
    wallet: PublicKey
  ): Promise<string> {
    const credential = {
      type: credentialType,
      wallet: wallet.toString(),
      attributes: Array.from(this.attributes.keys()),
      timestamp: Date.now(),
    };

    const hash = sha256(new TextEncoder().encode(JSON.stringify(credential)));
    return encodeBase64(hash);
  }
}

export function createPrivateIdentity(client: ArciumClient): PrivateIdentity {
  return new PrivateIdentity(client);
}
