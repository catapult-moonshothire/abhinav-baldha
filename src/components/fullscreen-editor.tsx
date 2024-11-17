"use client";

import { Loader, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Controller } from "react-hook-form";
import { MinimalTiptapEditor } from "./minimal-tiptap";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FullScreenEditorProps } from "@/lib/types";

export default function FullScreenEditor({
  currentPost,
  content,
  setContent,
  onSubmit,
  onCancel,
  onSaveDraft,
  register,
  errors,
  control,
  isSubmitting,
  isValid,
}: FullScreenEditorProps) {
  return (
    <div className="fixed inset-0 z-50 bg-background">
      <div className="flex h-full flex-col">
        <header className="flex items-center justify-between border-b p-4">
          <h2 className="text-2xl font-bold">
            {currentPost ? "Edit Post" : "New Post"}
          </h2>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={onSaveDraft}
              disabled={isSubmitting}
            >
              Save as Draft
            </Button>
            <Button
              type="submit"
              onClick={onSubmit}
              disabled={isSubmitting || !isValid || !content}
            >
              {isSubmitting ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  {currentPost ? "Updating..." : "Publishing..."}
                </>
              ) : currentPost ? (
                "Update Post"
              ) : (
                "Publish"
              )}
            </Button>
            <Button
              variant="destructive"
              size="icon"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </header>
        <form className="flex flex-1 max-sm:flex-col overflow-hidden">
          <div className="flex-1 max-sm:w-full sm:overflow-auto p-4">
            <div className="mb-4">
              <Controller
                name="title"
                control={control}
                rules={{ required: "Title is required" }}
                render={({ field }) => (
                  <Input
                    placeholder="Post Title"
                    className="text-2xl  font-bold border-0 px-0 focus-visible:ring-0"
                    disabled={isSubmitting}
                    {...field}
                  />
                )}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-destructive">
                  {errors.title.message}
                </p>
              )}
            </div>
            <MinimalTiptapEditor
              value={content}
              onChange={setContent}
              className="sm:min-h-[500px]"
              editorContentClassName="prose max-w-none"
              output="html"
              placeholder="Start writing your post..."
              autofocus={true}
              editable={!isSubmitting}
            />
          </div>
          <div className="sm:w-80 border-l overflow-y-auto">
            <div className="p-4 space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Post Settings</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="slug">Slug</Label>
                    <Controller
                      name="slug"
                      control={control}
                      rules={{
                        required: "Slug is required",
                        pattern: {
                          value: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                          message:
                            "Slug must be lowercase, numbers, and hyphens only",
                        },
                      }}
                      render={({ field }) => (
                        <Input
                          id="slug"
                          placeholder="post-url-slug"
                          {...field}
                        />
                      )}
                    />
                    {errors.slug && (
                      <p className="mt-1 text-sm text-destructive">
                        {errors.slug.message}
                      </p>
                    )}
                  </div>
                  <div className="mb-4 sm:flex sm:space-x-4">
                    <div className="mb-4 sm:w-32">
                      <Label htmlFor="slug">Label</Label>
                      <Input
                        placeholder="Label (e.g., New)"
                        disabled={isSubmitting}
                        {...register("label")}
                      />
                    </div>
                    <div className="mb-4">
                      <Label htmlFor="slug">Author</Label>
                      <Input
                        placeholder="Author"
                        disabled={isSubmitting}
                        {...register("author", {
                          required: "Author is required",
                        })}
                      />
                      {errors.author && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.author.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Brief description of the post"
                      {...register("description")}
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Controller
                      name="category"
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="technology">
                              Technology
                            </SelectItem>
                            <SelectItem value="design">Design</SelectItem>
                            <SelectItem value="business">Business</SelectItem>
                            <SelectItem value="ideas">Ideas</SelectItem>
                            <SelectItem value="tutorial">Tutorial</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  <div>
                    <Label htmlFor="tags">Tags</Label>
                    <Input
                      id="tags"
                      placeholder="Add tags separated by commas"
                      {...register("tags")}
                    />
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">SEO Settings</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="metaTitle">Meta Title</Label>
                    <Input
                      id="metaTitle"
                      placeholder="SEO title"
                      {...register("meta_title")}
                    />
                  </div>
                  <div>
                    <Label htmlFor="metaDescription">Meta Description</Label>
                    <Textarea
                      id="metaDescription"
                      placeholder="SEO description"
                      {...register("meta_description")}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
