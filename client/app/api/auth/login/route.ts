
import { executeQuery } from "@/lib/oracle";

import { NextRequest, NextResponse } from "next/server";

import * as oracledb from 'oracledb';

import { UserRole } from "@/lib/auth-context";



export async function POST(req: NextRequest) {

  try {

    const { email, password, role } = await req.json();

    console.log("Login attempt for:", { email, role });



    if (!email || !password || !role) {

      return NextResponse.json({ error: "Email, password, and role are required" }, { status: 400 });

    }



        const initialUserQuery = await executeQuery(



          `SELECT user_id, name, password FROM users WHERE email = :email AND role = :role AND is_active = 1`,



          { email, role }



        );



        console.log("Initial user query result:", initialUserQuery);



    



        if (Array.isArray(initialUserQuery) && initialUserQuery.length > 0) {



          const userRecord = initialUserQuery[0];



          



          // WARNING: Storing and comparing plain text passwords is a security risk.



          // This is for proof-of-concept purposes only.



          const storedPassword = userRecord.PASSWORD;



          const match = password === storedPassword;

      console.log("Password match result:", match);



      if (match) {

        // Password matches, login is successful.

        const user = {

          id: userRecord.USER_ID.toString(),

          email: email,

          name: userRecord.NAME,

          role: role as UserRole, // Use role from the request as it's already validated by the query

          company: role === "client" ? "Acme Corp" : "TechHouse",

          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,

        };

        console.log("Login successful, returning user:", user);

        return NextResponse.json(user);

      }

    }



    console.log("Login failed: Invalid credentials or user not found.");

    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

  } catch (error) {

    console.error("Error during login:", error);

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });

  }

}
