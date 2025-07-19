/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/zuvi.json`.
 */
export type Zuvi = {
  "address": "2h2Gw1oK7zNHed7GBXFShqvJGzBaVkPEMB7EDRUcVdct",
  "metadata": {
    "name": "zuvi",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Solana rental platform with VC integration"
  },
  "instructions": [
    {
      "name": "acceptApplication",
      "docs": [
        "房東接受申請"
      ],
      "discriminator": [
        32,
        123,
        133,
        159,
        182,
        237,
        161,
        163
      ],
      "accounts": [
        {
          "name": "listing",
          "writable": true
        },
        {
          "name": "application",
          "writable": true
        },
        {
          "name": "owner",
          "signer": true
        },
        {
          "name": "clock",
          "address": "SysvarC1ock11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "applyForRental",
      "docs": [
        "申請租房"
      ],
      "discriminator": [
        61,
        26,
        207,
        110,
        237,
        183,
        191,
        74
      ],
      "accounts": [
        {
          "name": "listing"
        },
        {
          "name": "application",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  112,
                  112,
                  108,
                  105,
                  99,
                  97,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "listing"
              },
              {
                "kind": "account",
                "path": "applicant"
              }
            ]
          }
        },
        {
          "name": "applicant",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "clock",
          "address": "SysvarC1ock11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "applicantAttestation",
          "type": "string"
        },
        {
          "name": "proposedTerms",
          "type": "string"
        }
      ]
    },
    {
      "name": "createContract",
      "docs": [
        "創建租賃合約"
      ],
      "discriminator": [
        244,
        48,
        244,
        178,
        216,
        88,
        122,
        52
      ],
      "accounts": [
        {
          "name": "listing",
          "writable": true
        },
        {
          "name": "application"
        },
        {
          "name": "contract",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  116,
                  114,
                  97,
                  99,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "listing"
              },
              {
                "kind": "account",
                "path": "application.applicant",
                "account": "rentalApplication"
              }
            ]
          }
        },
        {
          "name": "escrowAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  101,
                  115,
                  99,
                  114,
                  111,
                  119
                ]
              },
              {
                "kind": "account",
                "path": "contract"
              }
            ]
          }
        },
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "clock",
          "address": "SysvarC1ock11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "startDate",
          "type": "i64"
        },
        {
          "name": "endDate",
          "type": "i64"
        },
        {
          "name": "paymentDay",
          "type": "u8"
        },
        {
          "name": "contractHash",
          "type": "string"
        }
      ]
    },
    {
      "name": "delistProperty",
      "docs": [
        "下架房源"
      ],
      "discriminator": [
        239,
        82,
        222,
        180,
        186,
        53,
        144,
        15
      ],
      "accounts": [
        {
          "name": "listing",
          "writable": true
        },
        {
          "name": "owner",
          "signer": true
        }
      ],
      "args": []
    },
    {
      "name": "initializePlatform",
      "docs": [
        "初始化平台"
      ],
      "discriminator": [
        119,
        201,
        101,
        45,
        75,
        122,
        89,
        3
      ],
      "accounts": [
        {
          "name": "platform",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  108,
                  97,
                  116,
                  102,
                  111,
                  114,
                  109
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "feeReceiver"
        },
        {
          "name": "usdcMint"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "listingFee",
          "type": "u64"
        },
        {
          "name": "contractFee",
          "type": "u64"
        },
        {
          "name": "paymentFee",
          "type": "u64"
        }
      ]
    },
    {
      "name": "listProperty",
      "docs": [
        "發布房源"
      ],
      "discriminator": [
        254,
        101,
        42,
        174,
        220,
        160,
        42,
        82
      ],
      "accounts": [
        {
          "name": "platform",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  108,
                  97,
                  116,
                  102,
                  111,
                  114,
                  109
                ]
              }
            ]
          }
        },
        {
          "name": "listing",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  108,
                  105,
                  115,
                  116,
                  105,
                  110,
                  103
                ]
              },
              {
                "kind": "arg",
                "path": "propertyId"
              }
            ]
          }
        },
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "ownerUsdcAccount",
          "writable": true
        },
        {
          "name": "platformUsdcAccount",
          "writable": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "clock",
          "address": "SysvarC1ock11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "propertyId",
          "type": "string"
        },
        {
          "name": "ownerAttestation",
          "type": "string"
        },
        {
          "name": "monthlyRent",
          "type": "u64"
        },
        {
          "name": "depositMonths",
          "type": "u8"
        },
        {
          "name": "propertyDetailsHash",
          "type": "string"
        }
      ]
    },
    {
      "name": "payMonthlyRent",
      "docs": [
        "支付月租"
      ],
      "discriminator": [
        144,
        48,
        219,
        104,
        253,
        102,
        160,
        11
      ],
      "accounts": [
        {
          "name": "platform",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  108,
                  97,
                  116,
                  102,
                  111,
                  114,
                  109
                ]
              }
            ]
          }
        },
        {
          "name": "contract",
          "writable": true
        },
        {
          "name": "tenant",
          "writable": true,
          "signer": true
        },
        {
          "name": "tenantUsdcAccount",
          "writable": true
        },
        {
          "name": "landlordUsdcAccount",
          "writable": true
        },
        {
          "name": "platformUsdcAccount",
          "writable": true
        },
        {
          "name": "paymentRecord",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  97,
                  121,
                  109,
                  101,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "contract"
              },
              {
                "kind": "arg",
                "path": "paymentMonth"
              }
            ]
          }
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "clock",
          "address": "SysvarC1ock11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "paymentMonth",
          "type": "string"
        }
      ]
    },
    {
      "name": "rejectApplication",
      "docs": [
        "房東拒絕申請"
      ],
      "discriminator": [
        85,
        73,
        224,
        47,
        9,
        184,
        39,
        217
      ],
      "accounts": [
        {
          "name": "listing"
        },
        {
          "name": "application",
          "writable": true
        },
        {
          "name": "owner",
          "signer": true
        },
        {
          "name": "clock",
          "address": "SysvarC1ock11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "signContractAndPay",
      "docs": [
        "租客簽署合約並支付押金+首月租金"
      ],
      "discriminator": [
        215,
        129,
        7,
        181,
        238,
        118,
        172,
        195
      ],
      "accounts": [
        {
          "name": "platform",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  108,
                  97,
                  116,
                  102,
                  111,
                  114,
                  109
                ]
              }
            ]
          }
        },
        {
          "name": "listing",
          "writable": true
        },
        {
          "name": "contract",
          "writable": true
        },
        {
          "name": "tenant",
          "writable": true,
          "signer": true
        },
        {
          "name": "tenantUsdcAccount",
          "writable": true
        },
        {
          "name": "escrowAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  101,
                  115,
                  99,
                  114,
                  111,
                  119
                ]
              },
              {
                "kind": "account",
                "path": "contract"
              }
            ]
          }
        },
        {
          "name": "platformUsdcAccount",
          "writable": true
        },
        {
          "name": "depositPaymentRecord",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  97,
                  121,
                  109,
                  101,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "contract"
              },
              {
                "kind": "const",
                "value": [
                  100,
                  101,
                  112,
                  111,
                  115,
                  105,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "firstMonthPaymentRecord",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  97,
                  121,
                  109,
                  101,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "contract"
              },
              {
                "kind": "const",
                "value": [
                  102,
                  105,
                  114,
                  115,
                  116,
                  95,
                  109,
                  111,
                  110,
                  116,
                  104
                ]
              }
            ]
          }
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "clock",
          "address": "SysvarC1ock11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "terminateContract",
      "docs": [
        "正常退租"
      ],
      "discriminator": [
        39,
        195,
        134,
        151,
        240,
        183,
        194,
        205
      ],
      "accounts": [
        {
          "name": "listing",
          "writable": true
        },
        {
          "name": "contract",
          "writable": true
        },
        {
          "name": "escrowAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  101,
                  115,
                  99,
                  114,
                  111,
                  119
                ]
              },
              {
                "kind": "account",
                "path": "contract"
              }
            ]
          }
        },
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "escrowTokenAccount",
          "writable": true
        },
        {
          "name": "tenantUsdcAccount",
          "writable": true
        },
        {
          "name": "refundPaymentRecord",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  97,
                  121,
                  109,
                  101,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "contract"
              },
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  102,
                  117,
                  110,
                  100
                ]
              }
            ]
          }
        },
        {
          "name": "escrowAuthority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  101,
                  115,
                  99,
                  114,
                  111,
                  119
                ]
              },
              {
                "kind": "account",
                "path": "contract"
              }
            ]
          }
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "clock",
          "address": "SysvarC1ock11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "reason",
          "type": "string"
        }
      ]
    },
    {
      "name": "withdrawFees",
      "docs": [
        "提取平台費用"
      ],
      "discriminator": [
        198,
        212,
        171,
        109,
        144,
        215,
        174,
        89
      ],
      "accounts": [
        {
          "name": "platform",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  108,
                  97,
                  116,
                  102,
                  111,
                  114,
                  109
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "signer": true
        },
        {
          "name": "platformUsdcAccount",
          "writable": true
        },
        {
          "name": "recipientUsdcAccount",
          "writable": true
        },
        {
          "name": "feeReceiver",
          "signer": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "escrowAccount",
      "discriminator": [
        36,
        69,
        48,
        18,
        128,
        225,
        125,
        135
      ]
    },
    {
      "name": "paymentRecord",
      "discriminator": [
        202,
        168,
        56,
        249,
        127,
        226,
        86,
        226
      ]
    },
    {
      "name": "platform",
      "discriminator": [
        77,
        92,
        204,
        58,
        187,
        98,
        91,
        12
      ]
    },
    {
      "name": "propertyListing",
      "discriminator": [
        174,
        25,
        33,
        12,
        133,
        179,
        107,
        36
      ]
    },
    {
      "name": "rentalApplication",
      "discriminator": [
        79,
        198,
        211,
        18,
        226,
        157,
        162,
        22
      ]
    },
    {
      "name": "rentalContract",
      "discriminator": [
        45,
        116,
        9,
        6,
        145,
        34,
        166,
        125
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "platformAlreadyInitialized",
      "msg": ""
    },
    {
      "code": 6001,
      "name": "platformNotInitialized",
      "msg": ""
    },
    {
      "code": 6002,
      "name": "invalidFeeAmount",
      "msg": ""
    },
    {
      "code": 6003,
      "name": "invalidPropertyId",
      "msg": "無效的房產 ID"
    },
    {
      "code": 6004,
      "name": "invalidAttestation",
      "msg": "無效的 attestation"
    },
    {
      "code": 6005,
      "name": "propertyAlreadyListed",
      "msg": ""
    },
    {
      "code": 6006,
      "name": "listingNotFound",
      "msg": ""
    },
    {
      "code": 6007,
      "name": "invalidListingStatus",
      "msg": ""
    },
    {
      "code": 6008,
      "name": "notPropertyOwner",
      "msg": ""
    },
    {
      "code": 6009,
      "name": "applicationNotFound",
      "msg": ""
    },
    {
      "code": 6010,
      "name": "invalidApplicationStatus",
      "msg": ""
    },
    {
      "code": 6011,
      "name": "notApplicant",
      "msg": ""
    },
    {
      "code": 6012,
      "name": "contractNotFound",
      "msg": ""
    },
    {
      "code": 6013,
      "name": "invalidContractStatus",
      "msg": ""
    },
    {
      "code": 6014,
      "name": "notContractParty",
      "msg": ""
    },
    {
      "code": 6015,
      "name": "invalidPaymentDay",
      "msg": ""
    },
    {
      "code": 6016,
      "name": "invalidContractDuration",
      "msg": ""
    },
    {
      "code": 6017,
      "name": "contractStartDateMustBeFuture",
      "msg": ""
    },
    {
      "code": 6018,
      "name": "contractEndDateMustBeAfterStart",
      "msg": ""
    },
    {
      "code": 6019,
      "name": "depositMustBeGreaterThanZero",
      "msg": ""
    },
    {
      "code": 6020,
      "name": "rentMustBeGreaterThanZero",
      "msg": ""
    },
    {
      "code": 6021,
      "name": "incorrectPaymentAmount",
      "msg": ""
    },
    {
      "code": 6022,
      "name": "rentAlreadyPaidForMonth",
      "msg": ""
    },
    {
      "code": 6023,
      "name": "contractNotStarted",
      "msg": ""
    },
    {
      "code": 6024,
      "name": "contractEnded",
      "msg": ""
    },
    {
      "code": 6025,
      "name": "depositAlreadyRefunded",
      "msg": ""
    },
    {
      "code": 6026,
      "name": "unpaidRentExists",
      "msg": ""
    },
    {
      "code": 6027,
      "name": "unauthorized",
      "msg": ""
    },
    {
      "code": 6028,
      "name": "insufficientBalance",
      "msg": ""
    },
    {
      "code": 6029,
      "name": "invalidUsdcMint",
      "msg": "無效的 USDC mint"
    },
    {
      "code": 6030,
      "name": "stringTooLong",
      "msg": ""
    },
    {
      "code": 6031,
      "name": "invalidWithdrawAmount",
      "msg": ""
    }
  ],
  "types": [
    {
      "name": "applicationStatus",
      "docs": [
        "申請狀態"
      ],
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "pending"
          },
          {
            "name": "accepted"
          },
          {
            "name": "rejected"
          },
          {
            "name": "cancelled"
          }
        ]
      }
    },
    {
      "name": "contractStatus",
      "docs": [
        "合約狀態"
      ],
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "pendingSignature"
          },
          {
            "name": "active"
          },
          {
            "name": "terminated"
          },
          {
            "name": "completed"
          }
        ]
      }
    },
    {
      "name": "escrowAccount",
      "docs": [
        "託管賬戶資訊"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "contract",
            "docs": [
              "對應的合約"
            ],
            "type": "pubkey"
          },
          {
            "name": "depositAmount",
            "docs": [
              "押金金額"
            ],
            "type": "u64"
          },
          {
            "name": "depositRefunded",
            "docs": [
              "是否已退還押金"
            ],
            "type": "bool"
          },
          {
            "name": "bump",
            "docs": [
              "bump seed"
            ],
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "listingStatus",
      "docs": [
        "房源狀態"
      ],
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "available"
          },
          {
            "name": "rented"
          },
          {
            "name": "delisted"
          }
        ]
      }
    },
    {
      "name": "paymentRecord",
      "docs": [
        "支付記錄賬戶"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "contract",
            "docs": [
              "對應的合約"
            ],
            "type": "pubkey"
          },
          {
            "name": "paymentType",
            "docs": [
              "支付類型"
            ],
            "type": {
              "defined": {
                "name": "paymentType"
              }
            }
          },
          {
            "name": "amount",
            "docs": [
              "金額"
            ],
            "type": "u64"
          },
          {
            "name": "payer",
            "docs": [
              "支付者"
            ],
            "type": "pubkey"
          },
          {
            "name": "receiver",
            "docs": [
              "接收者"
            ],
            "type": "pubkey"
          },
          {
            "name": "paymentMonth",
            "docs": [
              "支付月份 (如果是月租)"
            ],
            "type": {
              "option": "string"
            }
          },
          {
            "name": "paidAt",
            "docs": [
              "支付時間"
            ],
            "type": "i64"
          },
          {
            "name": "transactionSignature",
            "docs": [
              "交易簽名"
            ],
            "type": "string"
          },
          {
            "name": "bump",
            "docs": [
              "bump seed"
            ],
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "paymentType",
      "docs": [
        "支付類型"
      ],
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "deposit"
          },
          {
            "name": "firstMonth"
          },
          {
            "name": "monthlyRent"
          },
          {
            "name": "depositRefund"
          }
        ]
      }
    },
    {
      "name": "platform",
      "docs": [
        "平台配置賬戶"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "docs": [
              "平台管理員"
            ],
            "type": "pubkey"
          },
          {
            "name": "feeReceiver",
            "docs": [
              "費用接收者"
            ],
            "type": "pubkey"
          },
          {
            "name": "listingFee",
            "docs": [
              "發布房源費用 (0.01 USDC)"
            ],
            "type": "u64"
          },
          {
            "name": "contractFee",
            "docs": [
              "簽約費用 (0.05 USDC，雙方各付一半)"
            ],
            "type": "u64"
          },
          {
            "name": "paymentFee",
            "docs": [
              "支付手續費 (0.005 USDC)"
            ],
            "type": "u64"
          },
          {
            "name": "usdcMint",
            "docs": [
              "USDC mint 地址"
            ],
            "type": "pubkey"
          },
          {
            "name": "isInitialized",
            "docs": [
              "平台是否已初始化"
            ],
            "type": "bool"
          },
          {
            "name": "bump",
            "docs": [
              "bump seed"
            ],
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "propertyListing",
      "docs": [
        "房源列表賬戶"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "propertyId",
            "docs": [
              "房產 ID (對應 twland 憑證)"
            ],
            "type": "string"
          },
          {
            "name": "owner",
            "docs": [
              "房東地址"
            ],
            "type": "pubkey"
          },
          {
            "name": "ownerAttestation",
            "docs": [
              "房東的 attestation 查詢結果"
            ],
            "type": "string"
          },
          {
            "name": "monthlyRent",
            "docs": [
              "月租金 (USDC)"
            ],
            "type": "u64"
          },
          {
            "name": "depositMonths",
            "docs": [
              "押金月數"
            ],
            "type": "u8"
          },
          {
            "name": "propertyDetailsHash",
            "docs": [
              "房產詳細資料 IPFS hash"
            ],
            "type": "string"
          },
          {
            "name": "status",
            "docs": [
              "房源狀態"
            ],
            "type": {
              "defined": {
                "name": "listingStatus"
              }
            }
          },
          {
            "name": "currentTenant",
            "docs": [
              "當前租客 (如果已出租)"
            ],
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "currentContract",
            "docs": [
              "當前合約 (如果已出租)"
            ],
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "createdAt",
            "docs": [
              "創建時間"
            ],
            "type": "i64"
          },
          {
            "name": "bump",
            "docs": [
              "bump seed"
            ],
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "rentalApplication",
      "docs": [
        "租賃申請賬戶"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "listing",
            "docs": [
              "對應的房源"
            ],
            "type": "pubkey"
          },
          {
            "name": "applicant",
            "docs": [
              "申請人地址"
            ],
            "type": "pubkey"
          },
          {
            "name": "applicantAttestation",
            "docs": [
              "申請人的 attestation 查詢結果"
            ],
            "type": "string"
          },
          {
            "name": "proposedTerms",
            "docs": [
              "提議的條款 (JSON string)"
            ],
            "type": "string"
          },
          {
            "name": "status",
            "docs": [
              "申請狀態"
            ],
            "type": {
              "defined": {
                "name": "applicationStatus"
              }
            }
          },
          {
            "name": "createdAt",
            "docs": [
              "創建時間"
            ],
            "type": "i64"
          },
          {
            "name": "updatedAt",
            "docs": [
              "更新時間"
            ],
            "type": "i64"
          },
          {
            "name": "bump",
            "docs": [
              "bump seed"
            ],
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "rentalContract",
      "docs": [
        "租賃合約賬戶"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "listing",
            "docs": [
              "對應的房源"
            ],
            "type": "pubkey"
          },
          {
            "name": "landlord",
            "docs": [
              "房東地址"
            ],
            "type": "pubkey"
          },
          {
            "name": "tenant",
            "docs": [
              "租客地址"
            ],
            "type": "pubkey"
          },
          {
            "name": "monthlyRent",
            "docs": [
              "月租金"
            ],
            "type": "u64"
          },
          {
            "name": "depositAmount",
            "docs": [
              "押金金額"
            ],
            "type": "u64"
          },
          {
            "name": "startDate",
            "docs": [
              "租約開始日期"
            ],
            "type": "i64"
          },
          {
            "name": "endDate",
            "docs": [
              "租約結束日期"
            ],
            "type": "i64"
          },
          {
            "name": "paymentDay",
            "docs": [
              "每月付款日 (1-28)"
            ],
            "type": "u8"
          },
          {
            "name": "contractHash",
            "docs": [
              "合約文件 IPFS hash"
            ],
            "type": "string"
          },
          {
            "name": "escrowAccount",
            "docs": [
              "託管賬戶 (PDA)"
            ],
            "type": "pubkey"
          },
          {
            "name": "status",
            "docs": [
              "合約狀態"
            ],
            "type": {
              "defined": {
                "name": "contractStatus"
              }
            }
          },
          {
            "name": "paidMonths",
            "docs": [
              "已支付月數"
            ],
            "type": "u16"
          },
          {
            "name": "createdAt",
            "docs": [
              "創建時間"
            ],
            "type": "i64"
          },
          {
            "name": "bump",
            "docs": [
              "bump seed"
            ],
            "type": "u8"
          }
        ]
      }
    }
  ]
};
