import io.quarkiverse.roq.frontmatter.runtime.model.DocumentPage;
import io.quarkiverse.roq.frontmatter.runtime.model.Page;
import io.quarkiverse.roq.frontmatter.runtime.model.RoqCollection;
import io.quarkus.qute.TemplateExtension;

import java.net.URL;
import java.util.stream.Collectors;

public class TemplateExtensions {

    @TemplateExtension
    public static String collectionTitles(RoqCollection collection) {
        return collection.stream()
                .map(DocumentPage::title)
                .collect(Collectors.joining(","));
    }

    @TemplateExtension
    public static String nextModule(Page page) {
        RoqCollection modules = page.site().collections().get("modules");
        return modules.stream()
                .filter(item -> item.id().equals(page.id()))
                .findFirst()
                .map(DocumentPage::next)
                .map(doc -> doc.url().relative())
                .orElse(modules.getFirst().url().relative());
    }
}
